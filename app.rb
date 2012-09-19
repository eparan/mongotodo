require 'rubygems'
require 'sinatra'
require 'mongo'
require 'json'
require 'haml'
require 'uri'

# puts "Running on MongoHQ" 
# heroku config:add 


def get_connection
  return @db_connection if @db_connection
  db = URI.parse(ENV['MONGOHQ_URL'])
  db_name = db.path.gsub(/^\//, '')
  @db_connection = Mongo::Connection.new(db.host, db.port).db(db_name)
  @db_connection.authenticate(db.user, db.password) unless (db.user.nil? || db.user.nil?)
  @db_connection
end
DB = get_connection

get '/' do
  haml :index, :attr_wrapper => '"', :locals => {:title => 'hello'}
end

get '/todo' do
  haml :todo, :attr_wrapper => '"', :locals => {:title => 'Our Sinatra Todo app'}
end

get '/api/:thing' do
  # query a collection :thing, convert the output to an array, map the _id
  # to a string representation of the object's _id and finally output to JSON.
  DB.collection(params[:thing]).find.to_a.map{|t| from_bson_id(t)}.to_json
end

get '/api/:thing/:id' do
  from_bson_id(DB.collection(params[:thing]).find_one(to_bson_id(params[:id]))).to_json
end

post '/api/:thing' do
  oid = DB.collection(params[:thing]).insert(JSON.parse(request.body.read.to_s))
  "{\"_id\":\"#{oid.to_s}\"}"
end

delete '/api/:thing/:id' do
  DB.collection(params[:thing]).remove('_id' => to_bson_id(params[:id]))
end

put '/api/:thing/:id' do
  DB.collection(params[:thing]).update({'_id' => to_bson_id(params[:id])}, {'$set' => JSON.parse(request.body.read.to_s).reject{|k,j| k == '_id'}})
end

def to_bson_id(id) BSON::ObjectId.from_string(id) end
def from_bson_id(obj) obj.merge({'_id' => obj['_id'].to_s}) end

