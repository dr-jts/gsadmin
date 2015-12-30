(function() {
	Tabs = function(id) {
		this.id = id;
	}
	
	Tabs.prototype.init = function(tabid) {
		$('.tab-panel').hide(); // hide all tab divs
		$('#'+tabid).show(); // show first tab
		$('#tabsnav li:first').addClass('active');
	
		$('.tab-item').click(function(){
		   jQuery('#tabsnav li').removeClass('active');
		   var currentTab = $(this).attr('href');
		   $('#tabsnav li a[href="'+currentTab+'"]').parent().addClass('active');
		   $('.tab-panel').hide();
		   $(currentTab).show();
		   return false;
		});
	}
})();
