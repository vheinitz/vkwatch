import os
import sys
import json
import urllib2
import vk_auth

import pymongo

groups = [ '11744730' ] #autism1
#groups = [ '41628527' ] #outfund
#groups = [ '12284677' ] #http://www.autism.com.ua
#groups = [ '55740425' ] #https://vk.com/autism_bez_paniki



queries = [ '%D0%90%D1%83%D1%82%D0%B8%D0%B7%D0%BC' ] #autism
users =[ 172940952, 1694092 ]

client = pymongo.MongoClient("localhost", 27017)
db = client.vk
#print db.name

#Scan group members
#https://vk.com/dev/groups.getMembers?params[group_id]=11744730&params[sort]=id_asc&params[offset]=0&params[count]=0&params[fields]=sex,bdate,city,country,photo_200,online,online_mobile,lists,domain,has_mobile,contacts,connections,site,education,universities,schools,can_post,can_see_all_posts,can_write_private_message,status,last_seen,common_count,relation,relatives,counters&params[v]=5.50

#last group news
#https://vk.com/dev/wall.get?params[owner_id]=-11744730&params[offset]=0&params[count]=10&params[filter]=group&params[extended]=0&params[v]=5.50

app_id = "" #""
login = "" #raw_input(u"Enter your login: ")
password = "" #raw_input(u"Enter your pass: ")

class Auth:
	def __init__(self,app_id,login,password):
		self.access_token = vk_auth.auth(login, password, app_id, "offline,messages")[0]
		print(self.access_token)

class GroupScanner:
	def __init__(self):
		self.groups = groups
				
	def scan(self):
		#for grp in groups: 
		idx=0
		for grp in db['group_info'].find(): #.skip(20):
			#print g
			try:
				#if not hasattr(grp, 'id'):
				#	continue
					
				g = grp["id"]
				grpkey = grp["_id"]

				url = "https://api.vk.com/method/wall.get?owner_id=-%s&count=1&offset=0&extended=0&v=5.50" % (g)
				print url
				topics_cnt = json.loads(urllib2.urlopen(url).read())["response"]["count"]
				#db[grpkey].drop()
				print "Scanning group - (%d) %s Nr:%d" % (topics_cnt,g, idx)
				idx = idx+1
				for o in range(0, topics_cnt, 100):
					url = "https://api.vk.com/method/wall.get?owner_id=-%s&count=15&offset=%i&extended=0&v=5.50" % (g, o)
					#print url
					topics = json.loads(urllib2.urlopen(url ).read())
					for item in topics["response"]["items"]:			
						#print  g, item["id"]
						item["_id"] = "gid_%s_topic_%d" % (g, item["id"])
						try:				
							db["group_data"].insert_one(item).inserted_id
							print "New Topic!"
						except pymongo.errors.DuplicateKeyError:							
							#print "Topic already in DB"
							pass
						
						#print item["_id"]
						#lastcomments = db["group_data"].find({"_id":item["_id"]}).first()["comments"]["count"]
						#nowComments = item["comments"]["count"]
						#print lastcomments, nowComments
						if True : #lastcomments < nowComments :
							for c in range( 0, item["comments"]["count"], 100 ):
								url= "https://api.vk.com/method/wall.getComments?owner_id=%d&post_id=%d&count=100&offset=%i&v=5.50" % (item["owner_id"],item["id"], c)
								#print url
								comments = json.loads(urllib2.urlopen( url ).read())
								for comment in reversed(comments["response"]["items"]):					
										#print  json.dumps(item), g,"  ",o,"."
										comment["_id"] = "gid_%stopic_%d_comment_%d" % (g, item["id"], comment["id"])
										try:
											db["group_data"].insert_one(comment).inserted_id
											print "New Comment!"
										except pymongo.errors.DuplicateKeyError:
											#print "Comment already in DB"
											pass
						else:
							pass
					break
					#print "No comment added"
			except:
				print "ERROR"
				pass
				
class GroupSelector:
	def __init__(self,queries, access_token):
		self.queries = queries
		self.access_token = access_token
		self.group_ids = []
		
	def select(self, min_user_count):
		for q in self.queries:
			
			url = "https://api.vk.com/method/groups.search?q=%s&type=group&future=0&market=0&sort=0&offset=0&count=1000&access_token=%s&v=5.50" % (q, self.access_token)
			print "Scanning:  ",q,url
			#https://vk.com/dev/groups.search?params[q]=%D0%90%D1%83%D1%82%D0%B8%D0%B7%D0%BC&params[type]=group&params[future]=0&params[market]=0&params[sort]=2&params[offset]=0&params[count]=1000&params[v]=5.50
			groups = json.loads(urllib2.urlopen( url ).read())
			#print  json.dumps(groups)
			for item in groups["response"]["items"]:			
				if  item["is_closed"] == 0 :
					#print  item["id"]				
					item["_id"] = "gid_%d" % item["id"]
					#https://vk.com/method/groups.getMembers?group_id=%s&offset=0&count=0&v=5.50
					url = "https://api.vk.com/method/groups.getMembers?group_id=%s&offset=0&count=0&v=5.50" % ( item["id"] )
					print url
					members = json.loads(urllib2.urlopen( url ).read())
					if members["response"]["count"] > min_user_count:
						self.group_ids.append(item["id"])
						db['group_info'].insert_one(item).inserted_id

						
						
class GroupMembers:
	def __init__(self, access_token):
		self.queries = queries
		self.access_token = access_token
		self.group_ids = []
		
	def laod(self):
		for g in db['group_info'].find():
			try:
				print g["id"]
				url = "https://api.vk.com/method/groups.getMembers?group_id=%s&offset=0&count=0&v=5.50" % (  g["id"] )
				print url
				members_cnt = json.loads(urllib2.urlopen( url ).read())["response"]["count"]
				for o in range( 0, members_cnt, 1000 ):
					#https://api.vk.com/method/groups.getMembers?group_id=11744730&offset=0&count=1000&fields=sex,bdate,city,country,photo_200,online,online_mobile,lists,domain,has_mobile,contacts,connections,site,education,universities,schools,can_post,can_see_all_posts,can_write_private_message,status,last_seen,common_count,relation,relatives,counters&v=5.50
					fields="sex,bdate,city,country,photo_200,online,online_mobile,lists,domain,has_mobile,contacts,connections,site,education,universities,schools,status"
					url = "https://api.vk.com/method/groups.getMembers?group_id=%s&offset=%d&count=1000&fields=%s&v=5.50" % (  g["id"], o, fields )
					print url
					members = json.loads(urllib2.urlopen( url ).read())
					for item in members["response"]["items"]:
						item["_id"] = "uid_%d" % item["id"]
						try:
							db['users'].insert_one(item)
							
						except pymongo.errors.DuplicateKeyError:
							#print "Comment already in DB"
							pass	
						
						db.group_info.update({"_id":g["_id"]},{"$push":{"members":item["_id"]}})
			except:
				print "ERROR"
				pass
							
gs = GroupScanner()
gs.scan()	

#auth = Auth(app_id,login,password)

#gsel = GroupSelector( queries,auth.access_token )
#gsel.select(100)

#gm = GroupMembers( "40e4799af7d8747d0ac3068fbdfd5be4f53a7cdcdd549917f01d99f18d5998634f3a7c5c2723716dec767" )
#gm.laod()
