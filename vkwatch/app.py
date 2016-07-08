import os
import sys
import json
import urllib2
import vk_auth
import pymongo

from bson.json_util import dumps

from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, _app_ctx_stack


app = Flask(__name__, static_url_path='')

client = pymongo.MongoClient("localhost", 27017)
db = client.vk

print db
#print dumps( db['users'].find() )

@app.route('/', methods = ['GET'])
def root():
    return app.send_static_file('./index.html')
    
@app.route('/api', methods = ['GET', 'POST'])
def login():
    if request.method == 'GET':
        for k in request.form:
           app.logger.debug(k,"=",request.form[k])
           app.logger.debug(k)
           if 's_' in k:
            filter = filter + "doc."+k+ "=='" + request.form[k] + "' "
            filter = filter + " || "
                
        filter = filter + 'false)'
#        return render_template("results.html", filter=filter)
        map_fun = 'function(doc) { ' + filter +  ' emit( doc.type, doc);} '
        app.logger.debug(map_fun)
    #    map_fun = '''function(doc) { if (doc.type == "image"){ emit([doc._id], {"name":doc.name, "result":doc.result, "sampleid":doc.sampleid, "testname":doc.testname});}}'''
        results = db.query(map_fun)
        return render_template("results.html",     
            results = results,
            attr=attr,
            attrmap=attrmap)
    else:
        return render_template("results.html", attr=attr)

@app.route('/users', methods=['GET', 'POST'])
def list_users():
    content = request.get_json()
    print  "CONT:", content
    filter = content['filter']
    limit = content['limit']
    if not limit:
        limit=100
     #  
    #print "FILTER:" , filter
    f = u'.*%s.*' % filter
    #print "F:" , f.encod
    if filter:
        return dumps(db['users'].find({'$or':[{'first_name':{'$regex':f }},{'last_name':{'$regex':f }}]} ).limit(limit))
        #return dumps(db['users'].find({'first_name':{'$regex':f }} ).limit(limit))
    #js = json.dumps(db['users'].find())
    return dumps(db['users'].find().limit(limit))
    
@app.route('/topics', methods=['GET', 'POST'])
def list_topics():
    content = request.get_json()
    print  "CONT:", content
    filter = content['filter']
    limit = content['limit']
    if not limit:
        limit=100
     #   
    #print "FILTER:" , filter
    f = u'.*%s.*' % filter
    #print u"F:" , f
    if filter:
        return dumps(db['group_data'].find({'text':{'$regex':f }} ).limit(limit))
    #js = json.dumps(db['group_data'].find())
    return dumps(db['group_data'].find().limit(limit))

@app.route('/count', methods=['GET', 'POST'])
def count_topics():
    content = request.get_json()
    print  "CONT:", content
    cnt = db['group_data'].find().count()
    data = '{"result":"ok","count":%d}'%(cnt)
    print data
    return data
    
if __name__ == '__main__':
    app.run(debug=True);   