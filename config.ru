require 'rubygems'
require 'sinatra'
require 'mongo'
require 'json'
require 'haml'
require "bson_ext"
require './app'

Bundler.require

run Sinatra::Application