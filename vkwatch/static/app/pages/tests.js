define(["knockout", "text!./tests.html"], function(ko, template ) {

	var Test = function( model, data) {
		//console.log( "Test", JSON.stringify(data) );
		var self = this;	
		this.model = model;	
		this.data = data;
		this.select = function() {
			console.log("select:" + self.data.id);
			self.model.selectTest( self )	
		}.bind(this);
        
	}	
	
 	function TestsViewModel()
	{
	    console.log("TestsViewModel");
	    var self = this;
		this.Tests = ko.observableArray();

		

		console.log("Pages", app_pages);

		this.init = function() {	   
			self.listTests();
			console.log( "init" );
		};

		this.listTests = function( )
		{
			console.log( "listTests " );
			$.post('/users','{"session":"ABCDEFG"}', function(data) {
				//console.log( "listTests ... ", data );
				js =  JSON.parse(data);
				console.log( js.length, "================================" );
				console.log( js );
				console.log( "============================================" );
				
				self.Tests([]);
				
				for(var di in js)
				{
					//self.Tests.push({id:js.devices[dev], type:"HELIOS", info:"Floor 001" });
					self.Tests.push(new Test(self, js[di]));
					//console.log( "INSTR:", di, data[di].first_name, data[di].photo_200 );
				}
				//setTimeout(self.listTests.bind(self), 3000);
			});
		};

		this.selectTest = function ( test) {
		    console.log("selectTest ", test.data.id);
		    app_share.test_id(test.data.id)
		    app_share.main_view('test');		  
		};

		this.init();
	}

  return { viewModel: TestsViewModel, template: template };

});
