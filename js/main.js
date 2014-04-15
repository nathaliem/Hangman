var answer;
var s,
Hangman = {
	settings: {
		word: answer,
		hangmanCounter: 1,
		score: 0,
		theme: $("#theme"),
		letter: $('.letter')
	},

	startGame: function() {
		s = this.settings;
		this.chooseTheme();
		this.generateAlphabet();
		this.setScore(s.score);
	},

	setScore: function(score){
		$('.game_score').text(score);
	},

	// Generate the letters on the bottom
	generateAlphabet: function(){
		var letters = [];

		// Go through the uppercase letters (with their charcode numbers)
		for(i=65;i<91;i++) {
			letters.push(String.fromCharCode(i));
		}

		for(i=0;i<letters.length;i++){
			$('.letters').append('<div class="letter active">'+letters[i]+'</div> ');
			
			// At the 13th letter, make an Enter
			if(i === 12){
				$('.letters').append('<br />');
			}
		}

		Hangman.bindUIActions();
	},

	chooseTheme: function(){
		$.getJSON("data/data.min.json", function(data){

			var themes = [];
			themes.length = 0;
			var countThemes = data.themes.theme.length;

			for(i=0;i<countThemes;i++){
				themes.push(data.themes.theme[i].title);
			}

			// Choose a random theme
			var randomNumber = Math.round(Math.random() * (countThemes -1));
			var theme = themes[randomNumber];

			s.theme.text(theme);

			Hangman.chooseWord(randomNumber);
		});
	},

	chooseWord: function(themeNumber){

		$.getJSON("data/data.min.json", function(data){
			var words = [];
			words.length = 0;
			var countWords = data.themes.theme[themeNumber].words.word.length;

			for(i=0;i<countWords;i++){
				words.push(data.themes.theme[themeNumber].words.word[i]);
			}
			
			// Choose a random word from this theme
			var randomNumber = Math.round(Math.random() * (countWords - 1));
			var word = data.themes.theme[themeNumber].words.word[randomNumber];

			s.word = word;

			Hangman.transformWord(s.word);
		});

	},

	transformWord: function(word){
		var placeholders = '';
		var space = '\ ';

		// Change word into underscores (and keep the spaces)
		for(i=0;i<word.length;i++){
			if(word[i] != space){
				placeholders += '_';
			} else {
				placeholders += ' ';
			}
		}

		$('#answer').text(placeholders);
	},

	bindUIActions: function(){
		$('.letter').on("click", function(){
			letter = $(this).text();
			Hangman.fadeLetter($(this));
			Hangman.checkLetterInWord(letter);
		});

		$(document).on('keyup', function(e){
			var letterInput = (String.fromCharCode(e.which)).toUpperCase();
			var letters = $('.letter');
			for(i=0;i<letters.length;i++){
				if(letters[i].innerHTML === letterInput){
					Hangman.fadeLetter(letters[i]);
				}
			}
			if(letterInput.match(/[^A-Z]/)){
				e.preventDefault();
			} else {
				Hangman.checkLetterInWord(letterInput);
			}
		});
	},

	fadeLetter: function(letter){
		// Let the user know which letter they've already tried
		$(letter).css('opacity', .5);
		$(letter).removeClass("active");
		$(letter).off("click");
	},

	checkLetterInWord: function(letter){

		// Check both uppercase and lowercase
		if(s.word.indexOf(letter) !== -1 || s.word.indexOf(letter.toLowerCase()) !== -1){

			var currentText = $('#answer').text();
			for(i=0;i<currentText.length;i++){
				if(letter == s.word[i] || letter.toLowerCase() == s.word[i]){
					var toChangeChar = currentText.charAt(i);
					
					// Replace character at found index(es)
					currentText = currentText.substring(0, i, letter) + letter + currentText.substring(i + 1);
				}
				$('#answer').text(currentText);

				// Check if there are still letters left to be found
				if($('#answer').text().indexOf('_') == -1) {
					$(document).off('keyup');
					Hangman.setScore(s.score++);
					$('.active').off("click").removeClass('active');
					Hangman.winOrLose(true);
					break;
				}

			}
		} else {
			$('.man' + s.hangmanCounter).css('display','block');
			s.hangmanCounter++;

			// Check if the hangman is fully drawn
			if(s.hangmanCounter == 12){
				s.score = 0;
				$(document).off('keyup');
				$('.active').off("click").removeClass('active');
				$('#answer').text(s.word);

				Hangman.winOrLose(false);
			}

		}
	},

	winOrLose: function(bool){
		$('.message').fadeIn('fast');
		if(bool){
			$('.whatMessage').text('Congratulations! You won! :)');
		} else {
			$('.whatMessage').text('Too bad! You lost! :(');
		}

		$('.play_again').on('click', function(){

			$(this).off('click');
			$(document).off('keyup');

			Hangman.resetGame();
			Hangman.startGame();
		});

		$(document).on('keyup', function(e) {

			if(e.which == 13) {
				$(this).off('keyup');
				$('.play_again').off('click');

				Hangman.resetGame();
				Hangman.startGame();
			}
		});
	},

	resetGame: function(){
		$('.message').fadeOut('fast');

		s.hangmanCounter = 1;

		for(i=1;i<12;i++){
			$('.man'+i).fadeOut('fast');
		}

		$('.letters').empty();
	},

	skipGame: function(){
		if(s.score !== 0){
			Hangman.setScore(s.score--);
		}

		Hangman.resetGame();

		Hangman.startGame();
	}
};

(function(){
	Hangman.startGame();
})();
