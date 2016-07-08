define(["knockout", "text!./userdashboard.html"], function(ko, template) {

    var CompletedTest = function (model, data) {
        var self = this;
        this.model = model;
        this.data = data;
        this.selected = ko.observable(false);
        this.select = function () {

            self.model.select( self.data )
        }.bind(this);

    }

    function UserDashBoardModel() {
        console.log("UserDashBoardModel")
	    var self = this;
	    this.user_name = ko.observable("");
	    this.completed_tests = ko.observableArray([]);

	    this.init = function () {
	        console.log("init");
	        self.user_name("Hans Mustermann");
	        self.completed_tests( [ new CompletedTest(self, { name: "ANA", date: "1.1.2001", score: 100 }), new CompletedTest(self, { name: "ANCA", date: "2.2.2012", score: 60 }) ] )
	    };

	    this.select = function (d) {
	        console.log("select ", d);
	    };

	    this.init()
    };


    return { viewModel: UserDashBoardModel, template: template };

});




