define(["knockout", "text!./topic.html"], function(ko, template) {

    function TopicModel( data ) {
        console.log("TopicModel")
	    var self = this;
	    var self = this;	
		this.data = data;
		this.date = timeConverter( data["date"] );
		this.select = function() {
			console.log("select:" + self.data.id);
			self.model.selectTopic( self )	
		}.bind(this);

    };


    return { viewModel: TopicModel, template: template };

});




