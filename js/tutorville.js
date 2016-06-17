(function(){
	var tutorData,
		tutorTemplate,
		tutorDataPromise,
		$tutorResults,
		
		init = function(){
			$tutorResults = $("#tutorResults");
			
			parseTutorTemplate();
			displayInitialTutorResults();
			
		},
		
		getTutorData = function(){
			$.ajax({
				url: "data/tutorResults.json",
				type: "GET",
				dataType: "json"
			}).done(function(d){
				tutorData = dataParsers.tutor(d);

				if(typeof tutorDataPromise === "function"){
					tutorDataPromise();
				}
			});
		},
		
		parseTutorTemplate = function(){
			tutorTemplate = $("#tutorTemplate").html();
			Mustache.parse(tutorTemplate);
		},
		
		displayInitialTutorResults = function(){
			if(typeof tutorData === "undefined"){
				tutorDataPromise = displayInitialTutorResults;
				return;
			}
			displayTutorResults(tutorData);
		},

		// if any of the search filters change it will rung the searchFilter method which will render the new results
		searchFilterChange = function(d) {
				$('#searchBar').on('change', function(){
					var subjectField = $('#subject-field').val().toLowerCase();
					searchFilter(d, subjectField);
			});
		},

		subjectLoop = function(tutor, textInput) {
			var subjects = tutor.Subjects;
			// loops through the subject array
			for(var i = 0; i <= subjects.length; i++) {
					var obj = subjects[i];
					// If not undefiend and converts the matching to lowercase
					obj = obj && obj.toLowerCase();
					// Lazy evaluation, if undefined not going continue; however, if the partial word or word exists it will return
					if (obj && obj.indexOf(textInput) > -1){  
						return true;
					}
			}
			return false;
		},

		addOnlineFilter = function(dCopy){
			dCopy.SearchResults = dCopy.SearchResults.filter(tutor => tutor.IsOnline);
		},

		addNearByFilter = function(dCopy){
			dCopy.SearchResults = dCopy.SearchResults.filter(tutor => tutor.Distance <= 5);
		},

		searchFilter = function(d, textInput) {	
			// makes a copy of the data
			var dCopy = jQuery.extend(true, {}, d);
			// Going to the subjectLoop function and returning the filtered result
			dCopy.SearchResults = dCopy.SearchResults.filter(tutor => subjectLoop(tutor, textInput));

			// the check for the isOnline checkbox
			if (document.getElementById('is-online').checked) {
					addOnlineFilter(dCopy);
			};
			// the check for the near by checkbox
			if (document.getElementById('near-by').checked) {
				addNearByFilter(dCopy);
			};

			var sortOrder = $('#sort-order').val();
			
			sortingFunction = function(sortType) {
				if (sortType === 'StarRating') {
					return dCopy.SearchResults.sort(function(a, b){
								return a.StarRating - b.StarRating;
							}
						)
				} else {
					return dCopy.SearchResults.sort(function(a, b){
								return a.HourlyRate - b.HourlyRate;
							}
						)
				}
			};

			if (sortOrder === 'highest-rank'){
					sortingFunction('StarRating').reverse();
			} else if (sortOrder === 'lowest-rank') {
					sortingFunction('StarRating');
			} else if (sortOrder === 'highest-price') {
					sortingFunction('HourlyRate').reverse();
			} else {
					sortingFunction('HourlyRate');
			};

			dCopy.SeachCount = dCopy.SearchResults.length;
			$tutorResults.html(Mustache.render(tutorTemplate, dCopy));
		},

		displayTutorResults = function(d){
			d.SeachCount = d.SearchResults.length;
			d.TutorCountIsNotOne = d.SearchResults.length !== 1;
			$tutorResults.html(Mustache.render(tutorTemplate, d));
			searchFilterChange(d);
		},
			
		dataParsers = {
			tutor: function(d){
				var l = d.SearchResults.length;
				
				while(l--){
					d.SearchResults[l].starPercent = (d.SearchResults[l].StarRating/5) * 100; 
				}
				
				return d;
			}
		};
	
	getTutorData();
	
	$(function(){
		init();
		
	});
})();
