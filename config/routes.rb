Rails.application.routes.draw do
  root 'matches#index'
  resources :matches, only: [:index, :new, :create, :show]
end