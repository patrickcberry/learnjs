describe('LearnJS', function(){

	it('can show a problem view', function(){
		learnjs.showView('#problem-1');
		expect($('.view-container .problem-view').length).toEqual(1);
	});

	it('shows the landing page view when there is no hash', function(){
		learnjs.showView('');
		expect($('.view-container .landing-view').length).toEqual(1);
	});	

	it('passes the hash view parameter to the view function', function(){
		spyOn(learnjs, 'problemView');
		learnjs.showView('#problem-43');
		expect(learnjs.problemView).toHaveBeenCalledWith('43');
	});

	describe('problem view', function() {
		it('has a title that includes the problem number', function() {
			var view = learnjs.problemView('1');
			expect($(view).find('.title').text()).toEqual('Problem #1');
		});
	});

	it('invokes the router when loaded', function() {
		spyOn(learnjs, 'showView');
		learnjs.appOnReady();
		expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
	});

	it('subscribe to the hash change event', function(){
		learnjs.appOnReady();
		spyOn(learnjs,'showView');
		$(window).trigger('hashchange');
		expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
	});

	describe('answer section', function(){

		var view;

		beforeEach(function(){
			view = learnjs.problemView('1');
		});

		it('can check a correct answer by hitting a button',function(){
			view.find('.answer').val('true');
			view.find('.check-btn').click();
			expect(view.find('.result .correct-flash').length).toEqual(1);
		});

		it('rejects an incorrect answer',function(){
			view.find('.answer').val('false');
			view.find('.check-btn').click();
			expect(view.find('.result').text()).toEqual('Incorrect!');			
		});		
	});

});

