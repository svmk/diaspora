class AddOwnerToConversationVisibility < ActiveRecord::Migration
  def self.up
    add_column :conversation_visibilities, :owner, :boolean
    add_column :conversation_visibilities, :editor, :boolean
    add_column :conversation_visibilities, :deleted, :boolean
    ConversationVisibility.find(:all).each do |p|
      p.owner = true
      p.editor = false
      p.deleted = false
      p.save
    end
  end

  def self.down
    remove_column :conversation_visibilities, :owner    
    remove_column :conversation_visibilities, :editor
    remove_column :conversation_visibilities, :deleted
  end
end
