/**********************************************
 Modal
 ***********************************************/

$('.provider-modal').on('click', function(e){
	$('.modal-bg').fadeIn(350, function(){
		$(this).removeClass('hidden');
	});

	if ($('.dd-navigation').is(':visible'))
	{
		$('.dd-navigation').slideToggle(350);
	}

	if ($('modal-bg').hasClass('hide-modal'))
	{
		$('.wrap').removeClass('hide-modal');
	}
	$('.wrap').addClass('show-modal');

	$('body').css('overflow', 'hidden');

	e.preventDefault();
});

$('.btn-close').on('click', function(e) {
	$('.modal-bg').fadeOut(450, function(){
		$(this).addClass('hidden');
	});

	$('.wrap').addClass('hide-modal').removeClass('show-modal');

	$('body').css('overflow','auto');

	e.preventDefault();
});