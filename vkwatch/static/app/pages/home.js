define(["knockout", "text!./home.html"], function(ko, template) {

function HomeViewModel(route) {
	console.log( "HomeViewModel" )
	var self = this;
	this.user = ko.observable('');
	this.password = ko.observable('');

	this.doLogin = function ( ) {
	    console.log("doLogin ", self.user(), self.password() );

	     $.post('/api/auth/login/' +self.user()+ 'user/'+self.password(), '', function (data) {

		        app_share.session( data.data.session );
		        console.log("doLogin ", data );
		  });   	    	  
	};

	this.doRegister = function ( ) {
	    console.log("doRegister ");	    	  
	};

	this.init = function() {	   
		console.log("Home.init");
		app_share.session( "12345" );

	};

	self.init();
}

 

  return { viewModel: HomeViewModel, template: template };

});
