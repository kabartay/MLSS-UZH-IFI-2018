jQuery(document).ready(function($) {
	var sbe_already_submitted = false;
	var buttonText = $( 'input[name="submit-subscribe-user"]').text();
	$( '.subscribe-by-email-subscribe-form' ).submit( function() {
		$( '.subscribe-by-email-loader' ).show();
		$( 'input[name="submit-subscribe-user"]').text( 'Subscribing...' ).attr({ 'disabled': true, 'aria-live': 'assertive' });
		if ( sbe_already_submitted ) {
			$( '.subscribe-by-email-loader' ).hide();
			return false;
		}
		
		var data = $(this).serialize();
		$.post( sbe_localized.ajaxurl, data, function(response) {
			if ( 'TRUE' === response ) {
				$( '.subscribe-by-email-error' ).hide().removeAttr( 'aria-live' );
				$( '.subscribe-by-email-updated' ).slideDown().attr( 'aria-live', 'assertive' ).focus();
				sbe_already_submitted = true;
			}
			else {
				$( '.subscribe-by-email-updated' ).hide().removeAttr( 'aria-live' );
				$( '.subscribe-by-email-error' ).slideDown().attr( 'aria-live', 'assertive' ).focus();
				$( 'input[name="submit-subscribe-user"]').attr( 'disabled', false ).text( buttonText ).removeAttr( 'aria-live' );
			}
			$( '.subscribe-by-email-loader' ).hide();

		});

		return false;
	});

	$('.subscribe-by-email-subscribe-form .subscribe-by-email-submit').click(function(event) {
		var form = $(this).parents('.subscribe-by-email-subscribe-form');
		if(!form.find('.g-recaptcha-response').val()) {
			event.preventDefault();
			form.find('.sbe-recaptcha-holder p').show().attr('role', 'alert');
			form.find('.sbe-recaptcha-holder .g-recaptcha').focus();
		}
	});
});