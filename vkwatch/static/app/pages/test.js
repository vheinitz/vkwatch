
var GlobTestViewModel = {}



function countDown() {
    GlobTestViewModel.countDownTime();
}

define(["knockout", "text!./test.html"], function (ko, template) {

    var Option = function (model, data) {
        //console.log( "Option", JSON.stringify(data) );
        var self = this;        
        this.model = model;
        this.data = data;
        this.selected = ko.observable(false);
        this.toggleSelection = function () {
            
            self.selected(!self.selected());
            //console.log("selected:", self.data.id, " = ", self.selected());
        }.bind(this);

    }

    var Position = function (x, y) {
        //console.log("Position",x,"x",y);
        var self = this;
        this.x = x;        
        this.y = y;
        this.used = false;
    }

	function TestViewModel()
	{
	    var self = this;

	    GlobTestViewModel = self;
		//console.log("TestViewModel", app_share.test_id());
		this.id = ko.observable(app_share.test_id() );
		this.name = ko.observable();
		this.questions = [];
		this.currentOptions = ko.observableArray();// ko.observableArray(["asdasd", "dfdfdf", "ghghg", "hjhj"]);
		this.currentQuestion = ko.observable();
		this.currentCnt = ko.observable(1);
		this.allCnt = ko.observable();
		this.image = ko.observable("noimg");
		this.remainingTime = ko.observable();
		this.viewMode = ko.observable('');
		this.resultsRight = ko.observable(0);
		this.resultsQuestionsCnt = ko.observable(0);
		
		this.enableAreaSelection = ko.observable(false);
		this.selectedPositions = ko.observableArray();
		this.qidx = 0;	
		this.markidx = 0;	
        		
		this.init = function() {	   
		    //console.log("init");
			self.TestData();
			setInterval( countDown, 1000 );
		};

		this.markArea = function( x,y,w,h )
		{
			if (typeof(w)==='undefined') w = 30;
   			if (typeof(h)==='undefined') h = 30;

			var markid = "cell"+self.markidx;
            self.markidx++;
            $("#imageContainer").append("<div id='"+markid+"' class='cellframe' data-bind='click: imageClick'></div>");

         
		    //show the menu directly over the placeholder
		    $("#"+markid).css({
		        position: "absolute",
		        top: y+h/2 + "px",
		        left: x + "px",
		        border: "1px solid blue",
		        background: "rgba(255,255,255,0.1)",
		        padding: "0px",
		        width: "30px",
		        "max-width": "30px", 
		        height: "30px", 
		        "max-height": "30px" 
		    }).show();

		    self.selectedPositions.push(new Position(x,y));
		    console.log("markArea", x,"x",y );
		};

		this.markAreaOnly = function( x,y )
		{
			var markid = "cell"+self.markidx;
            self.markidx++;
            $("#imageContainer").append("<div id='dev_"+markid+"' class='cellframe' data-bind='click: imageClick'></div>");
            $("#dev_"+markid).css({
		        position: "absolute",
		        top: y-h/2 + "px",
		        left: x + "px",
		        border: "1px solid blue",
		        background: "rgba(100,0,255,0.1)",
		        padding: "0px",
		        width: "30px",
		        "max-width": "30px", 
		        height: "30px", 
		        "max-height": "30px" 
		    }).show();
		};

		this.nextQuestion = function () {
		    //console.log("nextQuestion", self.qidx, self.questions.length );

		    var q = self.qidx;
		    var isTrue = true;
		    if ( self.questions[q].type == 'single_selection' )
	        {
	        	
	        	console.log("single_selection", self.currentOptions().length );
		        for (var o = 0; o < self.currentOptions().length; o++) {
		        	if ( (self.currentOptions()[o].data.is_true == 1 && !self.currentOptions()[o].selected())
		        		|| (self.currentOptions()[o].data.is_true == 0 && self.currentOptions()[o].selected())
		        		)
		        	{
		        		isTrue = false;
		        		break;
		        	}
		        }		        
		    }
		    else if ( self.questions[q].type == 'image_areas_find' )
		    {		       
	        	console.log("image_areas_find", self.selectedPositions().length );
	        	if ( self.selectedPositions().length <= 0 )
	        	{
	        		isTrue = false;
	        	}
		        for (var o = 0; o < self.selectedPositions().length; o++) {

		        	var RightPosition = false;
		        	for (var i = 0; i < self.questions[q].areas.length; i++) {
		        		console.log("POS", self.selectedPositions()[o].x,"x",self.selectedPositions()[o].y," ",
		        		 self.questions[q].areas[i].X,"x",self.questions[q].areas[i].Y);
		        		var Xq = self.questions[q].areas[i].X; 
		        		var Yq = self.questions[q].areas[i].Y;
		        		var Wq = self.questions[q].areas[i].W;
		        		var Hq = self.questions[q].areas[i].H;
		        		var Xs = self.selectedPositions()[o].x;
		        		var Ys = self.selectedPositions()[o].y;
			            if ( 
			            	!self.selectedPositions()[o].used &&
			            	( Xs >= Xq ) &&
			            	( Xs <= Xq+Wq ) &&
			            	( Ys >= Yq ) &&
			            	( Ys <= Yq+Hq ) 
			            )
						{
							RightPosition = true;
							self.selectedPositions()[o].used = true;
							console.log( "RightPosition = true" );
							break;
						}
			            
			        }
			        if ( !RightPosition ) //no match found
			        {
			            	isTrue = false;
			            	console.log( "RightPosition = false" );
			            	break;
			        }	        	
		        }
		    }
		    else
		    {
		    	isTrue = false;
		    }

		    self.questions[q].result = isTrue;
		    /*
            result_pk SERIAL PRIMARY KEY,
	auth_user_pkref INTEGER REFERENCES t_auth_user (auth_user_pk),
	test_id varchar(50),
	questions_count int,
	right_answers int,
	wrong_answers int,
	seconds_spent int
            */
		    //$.post('/api/answer/add', '{"auth_user_pkref":2, "test_id":"ANCA","questions_count":3,"right_answers":2,"wrong_answers":1,"seconds_spent":180 }', function (data) {
		    //var json = { "auth_user_pkref": 2, "test_id": "ANCA", "questions_count": 3, "right_answers": 2, "wrong_answers": 1, "seconds_spent": 180 };

		    json = { "auth_user_pkref": 2 }
		    json.test_id = self.id()
		    json.questions_count = self.questions.length
		    json.right_answers = self.resultsRight
		    json.wrong_answers = self.questions.length - self.resultsRight
		    json.seconds_spent = -1

		    console.log('/api/answer/add', JSON.stringify(json));
		    $.ajax({
		        url: "/api/answer/add",
		        type: "post",
		        data: JSON.stringify(json),
		        contentType: "application/json",
		        success: function (data) {
		            
		        },
		        error: function (jqXHR, textStatus, errorThrown) {
		            console.log("ERROR, DB error");
		        }
		    });
		    
		    //});   

		    self.qidx++;
		    this.currentCnt( self.qidx + 1 );
		    
		    if (self.qidx < self.questions.length ) {
		        self.updateQuestion();
		    }
		    else{
		        self.testFinished();
		    }
		};

		this.testFinished = function () {
		    console.log("testFinished");
		    self.viewMode("result");
		    self.removeAreaSelections();
		    self.currentOptions.removeAll();		    

		    self.image("noimg");		 

			var right = 0;
			console.log( "Results[]:",self.questions.length, ":", self.questions );

		    for (var i = 0; i < self.questions.length; i++) 
		    {
		    	right += (self.questions[i].result == true) ? 1 : 0;
		    	console.log( "   Results[]:",self.questions[i].result );

		    }
		    this.resultsRight( right ) ;
			this.resultsQuestionsCnt(self.questions.length);		   
		    self.qidx=0;
		};

		this.selectOption = function (test) {
		    console.log("selectOption ", test.data.id);
		};


		this.TestData = function () {
		    console.log("TestData :", '/api/test/:' + self.id());
		    self.qidx = 0;
		    $.post('/api/test/' + self.id(), '{"session":"ABCDEFG"}', function (data) {		        
		        self.id(data.id);
		        self.name(data.name);
		        self.questions = data.questions;
		        self.allCnt( self.questions.length );

		        console.log( '/api/test/:' + self.id(), data.questions, self.qidx, self.questions.length );

		        if (self.qidx < self.questions.length ) {
		            self.updateQuestion();
		        }
		        else{
		            self.testFinished();
		        }
		    });
		};

		this.countDownTime = function () {
			self.remainingTime( self.remainingTime()-1 );
			if ( self.remainingTime() <= 0 )
			{
				self.nextQuestion();
			}
		};

		this.removeAreaSelections = function () {
		    $(".cellframe").remove();
		    self.selectedPositions.removeAll();
		}

		this.updateQuestion = function () {
			
		    self.removeAreaSelections();
		    self.currentOptions.removeAll();		    		    
		    self.viewMode("");
		    self.image("noimg");		     
		    if (self.qidx <= self.questions.length) {
		    	self.viewMode("question");		    	
		        self.currentQuestion(self.questions[self.qidx].question);
		        self.image(self.questions[self.qidx].bgimage.id);
		        self.remainingTime(self.questions[self.qidx].time_limit);
		        //console.log("     Q:", self.questions[self.qidx], self.remainingTime());
		        var q = self.qidx;
		        if ( self.questions[q].type == 'single_selection' )
		        {
		            self.enableAreaSelection(false);
			        for (var o = 0; o < self.questions[q].options.length; o++) {
			            self.currentOptions.push(new Option(self, self.questions[q].options[o]));
			            //console.log( "Options", self.currentOptions().length );
			        }
			    }
			    else if ( self.questions[q].type == 'image_areas_find' )
			    {
			        self.enableAreaSelection(true);
			        for (var o = 0; o < self.questions[q].areas.length; o++) {
			            /*self.markAreaOnly(
			            	self.questions[q].areas[o].X,
			            	self.questions[q].areas[o].Y
			            	);			            
						*/
			        }
			    }

		    }
		};

		this.imageClick = function(data, event) {
            if ( self.enableAreaSelection() ) {
                self.markArea(event.offsetX, event.offsetY, ""); //todo fix positioning without const magics
            }
		    console.log( "imageClickAt: ", event.offsetX + "px", event.offsetY + "px" );
        };

		this.init();
	}

  return { viewModel: TestViewModel, template: template };

});

