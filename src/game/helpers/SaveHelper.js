// Singleton with helper methods for saving and loading and related string manipulation
define([
    'ash',
    'game/components/common/CampComponent',
    'game/components/common/CurrencyComponent',
    'game/components/sector/ReputationComponent',
    'game/components/common/VisitedComponent',
    'game/components/common/RevealedComponent',
	'game/components/sector/LastVisitedCampComponent',
    'game/components/sector/events/CampEventTimersComponent',
], function (Ash, CampComponent, CurrencyComponent, ReputationComponent, VisitedComponent, RevealedComponent, LastVisitedCampComponent, CampEventTimersComponent) {

    var SaveHelper = Ash.Class.extend({
	
		saveKeys: {
			player: "player",
			tribe: "tribe",
			sector: "sector-",
			level: "level-",
		},
		
		optionalComponents: [ CampComponent, CurrencyComponent, ReputationComponent, VisitedComponent, RevealedComponent, LastVisitedCampComponent, CampEventTimersComponent ],
		
		constructor: function () {
		},
		
		loadEntity: function (entitiesObject, saveKey, entity) {
			var failedComponents = 0;
			var savedComponents = entitiesObject[saveKey];
            var existingComponents = entity.getAll();
			for (var componentKey in savedComponents) {
                var componentDefinition = componentKey;
                var component = entity.get(componentDefinition);
                
                // if the component has a shortened save key, we have to compare to existing components to find the instance
                if (!component) {
                    for (var i in existingComponents) {
                        var existingComponent = existingComponents[i];
                        if (existingComponent.getSaveKey) {
                            if (existingComponent.getSaveKey() === componentKey) {
                                component = existingComponent;
                            }
                        }
                    }
                }
                
                var componentValues = savedComponents[componentKey];
                
				if (!component) {
					for(var i=0; i< this.optionalComponents.length; i++) {
						var optionalComponent = this.optionalComponents[i];
						if (componentKey == optionalComponent) {
							component = new optionalComponent();
							entity.add(component);
							break;
						}
					}
				}
				
				if (!component) {
					console.log("WARN: Component not found while loading:");
					console.log(componentKey);
					failedComponents++;
					continue;
				}
				
				if (component.customLoadFromSave) {
					component.customLoadFromSave(componentValues);
				} else {
					this.loadComponent(component, componentValues, saveKey);
				}
			}
			
			return failedComponents;
		},
			
		loadComponent: function(component, componentValues, saveKey) {
			// console.log(component);
			for(var valueKey in componentValues) {
				// console.log(valueKey + ": " + componentValues[valueKey]);
				if (typeof componentValues[valueKey] != 'object') {
					if (valueKey != "id") {
						component[valueKey] = componentValues[valueKey];
					}
				}
				else
				{
					if (component[valueKey] == null) continue;
					for(var valueKey2 in componentValues[valueKey]) {
						var value2 = componentValues[valueKey][valueKey2];
						// console.log(valueKey2 + ": " + value2)
						if (value2 === null) {
							continue;
						} else if (typeof value2 != 'object') {
							if (valueKey2 != "id") {
								component[valueKey][valueKey2] = value2;
							}
						} else if (parseInt(valueKey2) >= 0 && component[valueKey] instanceof Array) {
							var valueKey2Int = parseInt(valueKey2);
							if (!component[valueKey][valueKey2Int]) {
								component[valueKey][valueKey2Int] = {};    
							}
							this.loadObject(component[valueKey][valueKey2], componentValues[valueKey][valueKey2Int]);
						} else {
							if (!component[valueKey][valueKey2]) {
								console.log("WARN: Error loading. Unknown value key " + valueKey2 + " for object " + valueKey + " in " + saveKey);
								continue;
							}
							this.loadObject(component[valueKey][valueKey2], value2);
						}
					}
				}
			}
		},
		
		loadObject: function(object, attrValues) {
			for(var attr in attrValues) {
			var value = attrValues[attr];
			
			if (value == null) {
				continue;
			} else if (typeof value != 'object') {
				if (attr != "id") {
				if (attr == "loadedFromSave") {
					object[attr] = true;
				}
				else if (attr == "time" && this.isDate(value)) {
					object[attr] = new Date(value);
				} else {
					object[attr] = value;
				}
				}
			} else {
				if (!object[attr]) object[attr] = new Object();
				this.loadObject(object[attr], attrValues[attr]);
			}
			}	    
		},
		
		isDate: function(s) {
			return ((new Date(s) !== "Invalid Date" && !isNaN(new Date(s)) ));
		},
	
    });
    
    return SaveHelper;
});