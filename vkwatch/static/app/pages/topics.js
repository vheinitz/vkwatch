define(["knockout", "text!./topics.html"], function(ko, template ) {

	function timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp * 1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	  return time;
	}
	
	var Topic = function( model, data) {
		//console.log( "Topic", JSON.stringify(data) );
		var self = this;	
		this.model = model;	
		this.data = data;
		this.date = timeConverter( data["date"] );
		this.select = function() {
			console.log("select:" + self.data.id);
			self.model.selectTopic( self )	
		}.bind(this);
        
	}	
	
	

	


	
 	function TopicsViewModel()
	{
	    console.log("TopicsViewModel");
	    var self = this;
		this.Topics = ko.observableArray();
		this.Filter = ko.observable('');
		this.Limit = ko.observable(1000);
		this.FilteredCount = ko.observable();
		this.UseTopics = ko.observable(1);
		this.UseComments = ko.observable();

		

		console.log("Pages", app_pages);

		this.init = function() {	   
			//self.listTopics();
			console.log( "init" );
			self.countTopics();
		};

		this.countTopics = function( )
		{
			console.log("countTopics");
			$.ajax("/count", {
				data : '{"session":"ABCDEFG"}',
				contentType : 'application/json;charset=utf-8',
				type : 'POST',
				success:  function(data) {
					js =  JSON.parse(data);
					self.FilteredCount(js["count"]);
				}
			});
		}
		
		this.listTopics = function( )
		{
			filter = '{"session":"ABC", "filter":"' + self.Filter() + '", "use_topics":"' + self.UseTopics() + '", "use_comments":"' + self.UseComments() + '", "limit":' + self.Limit() +'}';
			console.log( "listTopics ", filter );						
			$.ajax("/topics", {
				data : filter,
				contentType : 'application/json',
				type : 'POST',
				success:  function(data) {
					js =  JSON.parse(data);
					
					self.Topics([]);
					cnt=0;
					for(var di in js)
					{
						cnt=di;
						self.Topics.push(new Topic(self, js[di]));
					}
					self.FilteredCount(cnt);
				}
			});
		};

		this.selectTopic = function ( topic) {
		    console.log("selectTopic ", topic.data.id);
		    app_share.topic_id(topic.data.id)
		    app_share.main_view('topic');		  
		};

		this.init();
	}

  return { viewModel: TopicsViewModel, template: template };

});
