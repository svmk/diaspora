 class ConversationsController < ApplicationController
  before_filter :authenticate_user!

  respond_to :html, :json

  def index
    @conversations = Conversation.joins(:conversation_visibilities).where(
      :conversation_visibilities => {:person_id => current_user.person.id}).paginate(
      :page => params[:page], :per_page => 15, :order => 'updated_at DESC')

    @visibilities = ConversationVisibility.where(:person_id => current_user.person.id).paginate(
      :page => params[:page], :per_page => 15, :order => 'updated_at DESC')

    @unread_counts = {}
    @visibilities.each { |v| @unread_counts[v.conversation_id] = v.unread }

    @authors = {}
    @conversations.each { |c| @authors[c.id] = c.last_author }

    @conversation = Conversation.joins(:conversation_visibilities).where(
      :conversation_visibilities => {:person_id => current_user.person.id, :conversation_id => params[:conversation_id]}).first
    @conversation_vis = ConversationVisibility.where(:conversation_id => params[:conversation_id]).order('owner DESC, editor DESC, deleted ASC')
    @allow_access = true
    if not @conversation_vis.any?{|i| i.person_id == current_user.person.id and not i.deleted} then
      # Access denied
      @allow_access = false
    end
    if params[:conversation_id] then
      @owner = @conversation_vis.any?{|i| i.person_id == current_user.person.id and i.owner and not i.deleted}
      @url_new_contact = url_for(:controller=>'conversations',:action=>'new_contact',:conversation_id=>params[:conversation_id])
    end
  end

  def create
    contact_ids = []
    if params[:contact_ids] then
      contact_ids = params[:contact_ids].split(',')
    end
    if contact_ids.length == 0 then
      flash[:notice] = t('.desteny_field_error')
      redirect_to conversations_path
      return
    end
    person_ids = Contact.where(:id => contact_ids).map! do |contact|
      contact.person_id
    end

    params[:conversation][:participant_ids] = person_ids | [current_user.person.id]
    params[:conversation][:author] = current_user.person

    @conversation = Conversation.create(params[:conversation])
    if @conversation  then
      @conversation.participants.update_all({:owner => false, :editor=> true, :deleted=> false})
      @conversation.participants.update_all({:owner => true, :editor=> true, :deleted=> false},{:id => current_user.person.id})
      Postzord::Dispatch.new(current_user, @conversation).post
      flash[:notice] = t('.message_sent')
      if params[:profile]
        redirect_to person_path(params[:profile])
      else
        redirect_to conversations_path(:conversation_id => @conversation.id)
      end
    end
  end

  def show
    @conversation_vis = ConversationVisibility.where(:conversation_id => params[:id]).order('owner DESC, editor DESC, deleted ASC')
    if not @conversation_vis.any?{|i| i.person_id == current_user.person.id and not i.deleted} then
      # Access denied
      render :access_denied,:layout=>false
      return
    end
    @owner = @conversation_vis.any?{|i| i.person_id == current_user.person.id and i.owner and not i.deleted}
    @url_new_contact = url_for(:controller=>'conversations',:action=>'new_contact',:conversation_id=>params[:id])
    @conversation = Conversation.joins(:conversation_visibilities).where(:id => params[:id],
      :conversation_visibilities => {:person_id => current_user.person.id}).first

    if @visibility = ConversationVisibility.where(:conversation_id => params[:id], :person_id => current_user.person.id).first
      @visibility.unread = 0
      @visibility.save
    end

    if @conversation
      render :layout => false
    else
      # render error message! don't redirect!
    end
  end

  def new
    @all_contacts_and_ids = current_user.contacts.map { |c| {:value => c.id, :name => c.person.name} }
    @contact = current_user.contacts.find(params[:contact_id]) if params[:contact_id]
    render :layout => false
  end

  def new_contact
    @aspect = :manage
    @contacts = current_user.contacts.includes(:person => :profile)
    @conversation_id = params[:conversation_id]    
    @active_contacts = ConversationVisibility.where(:conversation_id => @conversation_id).order('owner DESC, editor DESC, deleted ASC')
    #@active_contacts = ConversationVisibility.order('owner DESC, editor DESC, deleted ASC') + ConversationVisibility.order('owner DESC, editor DESC, deleted ASC')  # TODO!
    render :layout => false
  end
  
  def prepare_info(item)
    str = ''
    if item then
      if (item.owner) then
        str = str + 'O';
      end
      if (item.editor) then
        str = str + 'E';
      end
      if (not item.deleted) then
        str = str + 'R';
      end
    end
    return str
  end
  
  def is_owner
    item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => current_user.person.id).first
    return (item.owner and not item.deleted)
  end

  def create_contact
    if is_owner then
      @conversation = Conversation.find(params[:conversation_id])
      if @conversation then
        if not @conversation.participant_ids.any?{|rec| rec == params[:person_id].to_i} then
          @conversation.participant_ids = @conversation.participant_ids + [params[:person_id]]
        else
          item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
          if item then
            item.deleted = false
            item.save
          end
        end
        @participant = Person.find(params[:person_id])
      end
    end
    render :text => prepare_info(item),:layout => false
  end

  def delete_contact
    if is_owner then
      @conversation = Conversation.find(params[:conversation_id])
      if @conversation then
        count = ConversationVisibility.where(:conversation_id => params[:conversation_id],:deleted=>false).count(:all)
        item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
        if item and count > 1 then
          item.deleted = true
          item.owner = false
          item.editor = false
          item.save
        end
      end
    end
    render :text => prepare_info(item),:layout => false
  end
  
  def afford_to_own
    if is_owner then
      conversation = Conversation.find(params[:conversation_id])
      if conversation then
        item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
        if item then
          item.owner = true
          item.editor = true
          item.deleted = false
          item.save
        else
          ConversationVisibility.create(:conversation_id => params[:conversation_id],:person_id => params[:person_id],:owner => true, :editor=>true, :deleted => false, :unread=>true)
        end
      end
    end
    render :text=>prepare_info(item),:layout=>false
  end

  def prohibit_owning
    if is_owner then
      conversation = Conversation.find(params[:conversation_id])
      if conversation then
        count_owner = ConversationVisibility.where(:conversation_id => params[:conversation_id],:owner=>true).count(:all)
        item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
        if item and count_owner > 1 then
          item.owner = false
          item.save
        end
      end
    end
    render :text=>prepare_info(item),:layout=>false
  end

  def allow_edit
    if is_owner then
      conversation = Conversation.find(params[:conversation_id])
      if conversation then
        item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
        if item then
          item.editor = true
          item.deleted = false
          item.save
        else
          ConversationVisibility.create(:conversation_id => params[:conversation_id],:person_id => params[:person_id],:owner => false, :editor=>true, :deleted => false, :unread=>true)
        end
      end
    end
    render :text=>prepare_info(item),:layout=>false
  end

  def prohibit_edit
    if is_owner then
      conversation = Conversation.find(params[:conversation_id])
      if conversation then
        item = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => params[:person_id]).first
        if item then
          item.editor = false
          item.save
        end
      end
    end
    render :text=>prepare_info(item),:layout=>false
  end
end
