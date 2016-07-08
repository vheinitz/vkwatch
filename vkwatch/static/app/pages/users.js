define(["knockout", "text!./users.html"], function(ko, template ) {

	var User = function( model, data) {
		//console.log( "User", JSON.stringify(data) );
		var self = this;	
		this.model = model;	
		this.data = data;
		this.select = function() {
			console.log("select:" + self.data.id);
			self.model.selectUser( self )	
		}.bind(this);
        
	}	
	
 	function UsersViewModel()
	{
	    console.log("UsersViewModel");
	    var self = this;
		this.Users = ko.observableArray();
		this.Filter = ko.observable('');
		this.Limit = ko.observable(100);
		this.FilteredCount = ko.observable();

		

		console.log("Pages", app_pages);

		this.init = function() {	   
			//self.list();
			console.log( "init" );
		};

		this.list = function( )
		{
			filter = '{"session":"ABC", "filter":"' + self.Filter() + '",  "limit":' + self.Limit() +'}';
			console.log( "list ", filter );						
			$.ajax("/users", {
				data : filter,
				contentType : 'application/json',
				type : 'POST',
				success:  function(data) {
					js =  JSON.parse(data);
					
					self.Users([]);
					cnt=0;
					for(var di in js)
					{
						cnt=di;
						self.Users.push(new User(self, js[di]));
					}
					self.FilteredCount(cnt);
				}
			});
		};

		this.selectUser = function ( user) {
		    console.log("selectUser ", user.data.id);
		    app_share.user_id(user.data.id)
		    app_share.main_view('user');		  
		};

		this.init();
	}

  return { viewModel: UsersViewModel, template: template };

});
