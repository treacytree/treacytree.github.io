(function(win, doc) {
	var mt = win.MT || null,
		utils = mt && mt.utils ? mt.utils : null,
		showClass = 'selected';

	function resetFn(showClass, bodyEl) {
		return function(e) {
			var openEls = doc.getElementsByClassName(showClass);

			utils.arrayFix(openEls).forEach(function(el) {
				el.classList.remove(showClass);
			});
		}
	}

	function showChild(e) {
		var targEl = utils.findAncestor(e.target, 'li'),
			childList = targEl.querySelector('ul');

		if (targEl.classList.contains(showClass)) {
			targEl.classList.remove(showClass);
		} else {
			targEl.classList.add(showClass);
			utils.arrayFix(targEl.parentElement.children).forEach(function(el) {
				if (el !== targEl) {
					el.classList.remove(showClass);
				}
			});
		}
		if (targEl.getAttribute('data-title') === 'history') {
			utils.event.kill(e);
		}
	}

	function touchBinder(elMap, bind) {
		var reset = resetFn(showClass, elMap.body);
		utils.event.binder(elMap.navItems, {
			'touchStart': showChild
		}, bind);

		utils.event.binder([elMap.body, elMap.main, elMap.footer], {
			'touchStart': reset
		}, bind);
	}

	function mouseBinder(elMap, bind) {
		var reset = resetFn(showClass, elMap.body);
		utils.event.binder(elMap.navItems, {
			'click': showChild
		}, bind);

		utils.event.binder([elMap.body, elMap.main, elMap.footer], {
			'click': reset
		}, bind);
	}

	function bind(elMap) {
		var isMob = utils.isMobView(win, doc);

		touchBinder(elMap, !isMob);
		mouseBinder(elMap, isMob);
	}

	function getElMap() {
		return {
			body: doc.getElementsByTagName('body')[0],
			main: doc.getElementsByTagName('main')[0],
			header: doc.getElementsByTagName('header')[0],
			footer: doc.getElementsByTagName('footer')[0],
			navItems: doc.querySelectorAll('nav li')
		};
	}

	function init() {

		bind(getElMap());

	}

	win.addEventListener('DOMContentLoaded', init, false);

}(window, document));