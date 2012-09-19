require 'rubygems'
require 'sinatra'
require 'mongo'
require 'json'


DB = Mongo::Connection.new.db("mydb", :spool_size => 5, :timeout => 5)

class TodoApp < Sinatra::Base

  get '/' do
    haml :index,  :attr_wrapper => '"', :locals => {:title => 'hello'}
  end

  get '/todo' do
    haml :todo, :attr_wrapper => '"', :locals => {:title => 'Our Sinatra Todo app'}
  end

  get 'api/:thing' do
    # query a collection :thing, convert the output to an array, map the _id
    # to a string representation of the object's _id and finally output to JSON.
    DB.collecton(params[:thing]).find.to_a.map{|t| from_bson_id(t)}.to_json
  end

  