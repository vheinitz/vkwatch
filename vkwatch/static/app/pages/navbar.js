define(['knockout', 'text!./navbar.html'], function(ko, template) {

  function NavBarViewModel(params) {
      app_share.main_view("home");
      this.route = params.route;

      this.page_users = function ()
      {
          console.log("page_users");
          app_share.main_view("users");
      }
	  
	  this.page_topics = function ()
      {
          console.log("page_topics");
          app_share.main_view("topics");
      }

      this.page_home = function () {

          console.log("page_home ");
          app_share.main_view("home");
      }

      this.doLogout = function ( ) {
      console.log("doLogout ", app_share.session() );

       $.post('/api/auth/logout/' +app_share.session(), '', function (data) {
            app_share.session( null );
            console.log("doLogout ", data );
             app_share.main_view("home");
      });             
  };
  }



  return { viewModel: NavBarViewModel, template: template };
});
