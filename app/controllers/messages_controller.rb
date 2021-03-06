#   Copyright (c) 2010, Diaspora Inc.  This file is
#   licensed under the Affero General Public License version 3 or later.  See
#   the COPYRIGHT file.

class MessagesController < ApplicationController
  include ApplicationHelper
  before_filter :authenticate_user!

  respond_to :html, :mobile
  respond_to :json, :only => :show

  def create
    cnv = Conversation.joins(:conversation_visibilities).where(:id => params[:conversation_id],
                              :conversation_visibilities => {:person_id => current_user.person.id}).first

    if cnv
      cur_user = ConversationVisibility.where(:conversation_id => params[:conversation_id],:person_id => current_user.person.id).first
      if cur_user.editor and not cur_user.deleted then
      message = Message.new(:conversation_id => cnv.id, :text => params[:message][:text], :author => current_user.person)
      
      if message.save
        Rails.logger.info("event=create type=comment user=#{current_user.diaspora_handle} status=success message=#{message.id} chars=#{params[:message][:text].length}")
        Postzord::Dispatch.new(current_user, message).post

        redirect_to conversations_path(:conversation_id => cnv.id)
      else
        render :nothing => true, :status => 406
      end
    else
      flash[:error] = t('.sending_prohibited')
      redirect_to conversations_path(:conversation_id => cnv.id)
    end
    else
      render :nothing => true, :status => 406
    end
  end

end
