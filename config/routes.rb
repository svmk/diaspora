#   Copyright (c) 2010, Diaspora Inc.  This file is
#   licensed under the Affero General Public License version 3 or later.  See
#   the COPYRIGHT file.

Diaspora::Application.routes.draw do
  resources :status_messages, :only => [:new, :create, :destroy, :show]
  resources :comments,        :only => [:create]
  resources :requests,        :only => [:destroy, :create]

  match 'tags/:name' => 'tags#show'
  resources :tags, :only => [:show]

  resource :profile
  match 'services/inviter/:provider' => 'services#inviter', :as => 'service_inviter'
  match 'services/finder/:provider' => 'services#finder', :as => 'friend_finder'
  resources :services

  match 'admins/user_search' => 'admins#user_search'
  match 'admins/admin_inviter' => 'admins#admin_inviter'

  match 'notifications/read_all' => 'notifications#read_all'
  resources :notifications,   :only => [:index, :update]
  resources :posts,           :only => [:show], :path => '/p/'

  resources :contacts
  resources :aspect_memberships, :only => [:destroy, :create]

  match 'conversations/:conversation_id/afford_to_own/:person_id', :to => 'conversations#afford_to_own'
  match 'conversations/:conversation_id/prohibit_owning/:person_id', :to => 'conversations#prohibit_owning'
  match 'conversations/:conversation_id/allow_edit/:person_id', :to => 'conversations#allow_edit'
  match 'conversations/:conversation_id/prohibit_edit/:person_id', :to => 'conversations#prohibit_edit'
  match 'conversations/:conversation_id/delete_contact/:person_id', :to => 'conversations#delete_contact'
  match 'conversations/:conversation_id/create_contact/:person_id', :to => 'conversations#create_contact'
  match 'conversations/:conversation_id/new_contact', :to => 'conversations#new_contact'
  resources :conversations do
    resources :messages, :only => [:create, :show]
    resource :conversation_visibility, :only => [:destroy], :path => '/visibility/'
  end

  resources :people, :except => [:edit, :update] do
    resources :status_messages
    resources :photos
  end

  match '/people/by_handle' => 'people#retrieve_remote', :as => 'person_by_handle'
  match '/auth/:provider/callback' => 'services#create'
  match '/auth/failure' => 'services#failure'

  match 'photos/make_profile_photo' => 'photos#make_profile_photo'
  resources :photos, :except => [:index]

  devise_for :users, :controllers => {:registrations => "registrations",
                                      :password      => "devise/passwords",
                                      :invitations   => "invitations"} do

    get 'invitations/resend/:id' => 'invitations#resend', :as => 'invitation_resend'
                                      end


  # added public route to user
  match 'public/:username',          :to => 'users#public', :as => 'users_public'
  match 'getting_started',           :to => 'users#getting_started', :as => 'getting_started'
  match 'getting_started_completed', :to => 'users#getting_started_completed'
  match 'users/export',              :to => 'users#export'
  match 'users/export_photos',       :to => 'users#export_photos'
  match 'login'                      => redirect('/users/sign_in')
  resources :users,                  :except => [:create, :new, :show]

  match 'aspects/move_contact',      :to => 'aspects#move_contact', :as => 'move_contact'
  match 'aspects/add_to_aspect',     :to => 'aspects#add_to_aspect', :as => 'add_to_aspect'
  match 'aspects/remove_from_aspect',:to => 'aspects#remove_from_aspect', :as => 'remove_from_aspect'
  match 'aspects/manage',            :to => 'aspects#manage'
  resources :aspects do
    match '/toggle_contact_visibility', :to => 'aspects#toggle_contact_visibility'
  end

  #public routes
  match 'webfinger',            :to => 'publics#webfinger'
  match 'hcard/users/:guid',      :to => 'publics#hcard'
  match '.well-known/host-meta',:to => 'publics#host_meta'
  match 'receive/users/:guid',    :to => 'publics#receive'
  match 'hub',                  :to => 'publics#hub'

  match'localize', :to => "localize#show"
  match 'mobile/toggle', :to => 'home#toggle_mobile', :as => 'toggle_mobile'
  #root
  root :to => 'home#show'
end
