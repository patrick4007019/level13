// Singleton with helper methods for UI elements used throughout the game
define(['ash'], function (Ash) {
    
    var UIConstants = {
		
		FEATURE_MISSING_TITLE: "Missing feature",
		FEATURE_MISSING_COPY: "This feature is not yet implemented. Come back later!",
		
		resourceImages: {
			metal: "img/res-metal.png",
		},
        
		getItemLI: function (item, count, hideCallout) {
			var url = item.icon;
			var hasCount = count && count > 0;
			
			var classes = "item";
			if (item.equipped) classes += " item-equipped";
			if (hasCount) classes += " item-with-count";
			var li = "<li class='" + classes + "' data-itemid='" + item.id + "' data-iteminstanceid='" + item.itemID + "'>";
			
			if (!hideCallout) {
				var detail = item.type;
				detail += this.getItemBonusText(item);
				li += "<div class='info-callout-target info-callout-target-small' description='" + item.name + " (" + detail + ")'>";
			}
			
			li += "<img src='" + url + "'/>";
			
			if (hasCount)
				li += "<div class='item-count lvl13-box-3'>" + count + "x </div>";
			
			if (!hideCallout) li += "</div>";
			
			li += "</li>"
			
			return li;
		},
		
		getItemList: function (items) {
			var html = "";
			for (var i = 0; i < items.length; i++) {
				html += this.getItemLI(items[i], 1);
			}
			return html;
		},
		
		getResourceLi: function (name, amount) {
			return "<li><div class='info-callout-target info-callout-target-small' description='" + name + "'>" + this.getResourceImg(name) + "</div> " + Math.round(amount) + "</li>";
		},
		
		getResourceList: function (resourceVO) {
			var html = "";
			for (var key in resourceNames) {
				var name = resourceNames[key];
				var amount = resourceVO.getResource(name);
				if (amount > 0) {
					var li = this.getResourceLi(name, amount);
					html += li;
				}
			}
			return html;
		},
		
		getItemBonusText: function (item) {
			if (item.bonus === 0)
				return "";
			else if (item.bonus > 1)
				return " +" + item.bonus;
			else if (item.bonus > 0)
				return " -" + Math.round((1-item.bonus)*100) + "%";
			else if (item.bonus > -1)
				return " +" + Math.round((1-item.bonus)*100) + "%";
			else
				return " " + item.bonus; 
		},
		
		createResourceIndicator: function (name, showName, id, showAmount, showChange) {
			var div = "<div class='stats-indicator' id='" + id + "'>";
			
			if (!showName) div = "<div class='info-callout-target info-callout-target-small' description='" + name + "'>" + div;
			else if(showChange) div = "<div class='info-callout-target' description=''>" + div;
			
			div += "<span class='icon'>";
			div += this.getResourceImg(name);
			if (!showName && !showChange) div += "</div>";
			div += "</span>";
			
			if (showName) div += "<span class='label'>" + name + "</span>";
			
			if (showAmount) div += "<span class='value'></span>";
			div += "<span class='change-indicator'></span>";
			div += "<span class='change'></span>";
			div += "<span class='forecast'></span>";
			div += "</div>";
			
			if (!showName || showChange) div = div + "</div>";
			
			return div;
		},
		
		updateResourceIndicator: function (name, id, value, change, storage, showChange, showDetails, visible) {
			$(id).toggle(visible);
			var roundedValue = value > 5 ? Math.floor(value) : Math.floor(value*10)/10;
			if (visible) {
				$(id).children(".value").text(roundedValue);
				$(id).children(".change").toggleClass("warning", change < 0);
				$(id).children(".change").toggle(showChange);
				$(id).children(".forecast").toggle(showDetails);
				$(id).children(".forecast").toggleClass("warning", change < 0);
				
				var isCappedByStorage = change > 0 && value >= storage;
				
				if (showChange) {
					$(id).children(".change").text(Math.round(change * 10000) / 10000 + "/s");
				}
				if (showDetails) {
					if (change > 0 && (storage - value > 0)) {
						$(id).children(".forecast").text("(" + this.getTimeToNum((storage - value) / change) + " to cap)");
					} else if (change < 0 && value > 0) {
						$(id).children(".forecast").text("(" + this.getTimeToNum(value / change) + " to 0)");
					} else if (value >= storage) {
						$(id).children(".forecast").text("(full)");
					} else {
						$(id).children(".forecast").text("");
					}
				}
			
				change = Math.round(change * 10000) / 10000;
				$(id).children(".change-indicator").toggleClass("indicator-increase", change > 0 && !isCappedByStorage);
				$(id).children(".change-indicator").toggleClass("indicator-decrease", change < 0);
				$(id).children(".change-indicator").toggleClass("indicator-even", change === 0 || isCappedByStorage);
			}
		},
		
		updateResourceIndicatorCallout: function (id, changeSources) {
			var content = "";
			var source;
			for (var i in changeSources) {
				source = changeSources[i];
				if (source.amount != 0) {
					content += source.source + ": " + Math.round(source.amount * 10000)/10000 + "/s<br/>";
				}
			}
			
			if (content.length <= 0) {
				content = "(no change)";
			}
			
			this.updateCalloutContent(id, content);
		},
		
		updateCalloutContent: function (targetElementId, content) {
			$(targetElementId).parents(".info-callout-target").siblings(".info-callout").children(".info-callout-content").html(content);
		},
		
		getTimeToNum: function (seconds) {
			seconds = Math.ceil(Math.abs(seconds));
			var minutes = seconds / 60;
			var hours = minutes / 60;
			var days = hours / 24;
			
			if (days > 2) {
			return Math.floor(days) + "days";
			}
			else if (hours > 2) {
			return Math.floor(hours) + "h";
			}
			else if (minutes > 2) {
			return Math.floor(minutes) + "min";
			} else {
			return Math.round(seconds) + "s";		
			}
		},
		
		getTimeSinceText: function(date) {
			var seconds = Math.floor((new Date() - date) / 1000);	
			var interval = Math.floor(seconds / 31536000);
		
			if (interval > 1) {
			return interval + " years";
			}
			interval = Math.floor(seconds / 2592000);
			if (interval > 1) {
			return interval + " months";
			}
			interval = Math.floor(seconds / 86400);
			if (interval > 1) {
			return interval + " days";
			}
			interval = Math.floor(seconds / 3600);
			if (interval > 1) {
			return interval + " hours";
			}
			interval = Math.floor(seconds / 60);
			if (interval > 1) {
			return interval + " minutes";
			}
			if (interval == 1) {
			return interval + " minute";
			}
			
			// seconds
			if (seconds < 10) {
			return "a few seconds";
			}
			
			return "less than a minute";
		},
		
		getResourceImg: function (name) {
			return "<img src='img/res-" + name + ".png' alt='" + name + "'/>"
		}
	
    };
    
    return UIConstants;
});