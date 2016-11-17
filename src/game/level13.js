define([
    'ash',
	'game/constants/GameConstants',
    'game/components/GameState',
    'game/systems/GameManager',
    'game/systems/SaveSystem',
    'game/systems/AutoPlaySystem',
    'game/systems/ui/UIOutHeaderSystem',
    'game/systems/ui/UIOutElementsSystem',
    'game/systems/ui/UIOutLevelSystem',
    'game/systems/ui/UIOutCampSystem',
    'game/systems/ui/UIOutEmbarkSystem',
    'game/systems/ui/UIOutBagSystem',
    'game/systems/ui/UIOutFollowersSystem',
    'game/systems/ui/UIOutMapSystem',
    'game/systems/ui/UIOutUpgradesSystem',
    'game/systems/ui/UIOutTribeSystem',
    'game/systems/ui/UIOutBlueprintsSystem',
    'game/systems/ui/UIOutFightSystem',
    'game/systems/ui/UIOutLogSystem',
    'game/systems/ui/UIOutPopupInnSystem',
    'game/systems/ui/UIOutPopupInventorySystem',
    'game/systems/CheatSystem',
    'game/systems/VisionSystem',
    'game/systems/StaminaSystem',
    'game/systems/PlayerPositionSystem',
    'game/systems/PlayerActionSystem',
    'game/systems/SectorStatusSystem',
    'game/systems/LevelPassagesSystem',
    'game/systems/CollectorSystem',
    'game/systems/FightSystem',
    'game/systems/PopulationSystem',
    'game/systems/WorkerSystem',
    'game/systems/FaintingSystem',
    'game/systems/ReputationSystem',
    'game/systems/RumourSystem',
    'game/systems/EvidenceSystem',
    'game/systems/GlobalResourcesSystem',
    'game/systems/GlobalResourcesResetSystem',
    'game/systems/BagSystem',
    'game/systems/HazardSystem',
    'game/systems/UnlockedFeaturesSystem',
    'game/systems/occurrences/CampEventsSystem',
    'game/constants/SystemPriorities',
    'game/EntityCreator',
    'game/PlayerActionFunctions',
    'game/OccurrenceFunctions',
    'game/UIFunctions',
    'game/helpers/PlayerActionsHelper',
    'game/helpers/PlayerActionResultsHelper',
    'game/helpers/ItemsHelper',
    'game/helpers/EnemyHelper',
    'game/helpers/ResourcesHelper',
    'game/helpers/MovementHelper',
    'game/helpers/FightHelper',
    'game/helpers/LevelHelper',
    'game/helpers/SectorHelper',
    'game/helpers/CampHelper',
    'game/helpers/ButtonHelper',
    'game/helpers/SaveHelper',
    'game/helpers/UpgradeEffectsHelper',
    'game/helpers/ui/UIMapHelper',
    'brejep/tickprovider',
], function (
    Ash,
	GameConstants,
    GameState,
    GameManager,
    SaveSystem,
    AutoPlaySystem,
    UIOutHeaderSystem,
    UIOutElementsSystem,
    UIOutLevelSystem,
    UIOutCampSystem,
    UIOutEmbarkSystem,
    UIOutBagSystem,
    UIOutFollowersSystem,
    UIOutMapSystem,
    UIOutUpgradesSystem,
    UIOutTribeSystem,
    UIOutBlueprintsSystem,
    UIOutFightSystem,
    UIOutLogSystem,
    UIOutPopupInnSystem,
    UIOutPopupInventorySystem,
    CheatSystem,
    VisionSystem,
    StaminaSystem,
    PlayerPositionSystem,
    PlayerActionSystem,
    SectorStatusSystem,
    LevelPassagesSystem,
    CollectorSystem,
    FightSystem,
    PopulationSystem,
    WorkerSystem,
    FaintingSystem,
    ReputationSystem,
    RumourSystem,
    EvidenceSystem,
    GlobalResourcesSystem,
    GlobalResourcesResetSystem,
    BagSystem,
    HazardSystem,
    UnlockedFeaturesSystem,
    CampEventsSystem,
    SystemPriorities,
    EntityCreator,
    PlayerActionFunctions,
    OccurrenceFunctions,
    UIFunctions,
    PlayerActionsHelper,
    PlayerActionResultsHelper,
    ItemsHelper,
    EnemyHelper,
    ResourcesHelper,
    MovementHelper,
    FightHelper,
    LevelHelper,
    SectorHelper,
    CampHelper,
    ButtonHelper,
    SaveHelper,
    UpgradeEffectsHelper,
    UIMapHelper,
    TickProvider
) {
    var Level13 = Ash.Class.extend({
	
        engine: null,
	
        gameState: null,
	
		uiFunctions: null,
		occurrenceFunctions: null,
		playerActionFunctions: null,
        cheatSystem: null,
		
		gameManager: null,
		saveSystem: null,
	
        tickProvider: null,

        constructor: function () {
            this.engine = new Ash.Engine();
			this.gameState = new GameState();
			
			// Global signals
			this.playerMovedSignal = new Ash.Signals.Signal();
			this.improvementBuiltSignal = new Ash.Signals.Signal();
			this.tabChangedSignal = new Ash.Signals.Signal();
            this.calloutsGeneratedSignal = new Ash.Signals.Signal();
	    
			// Singleton helper modules to be passed to systems that need them
            this.itemsHelper = new ItemsHelper(this.gameState);
            this.enemyHelper = new EnemyHelper(this.itemsHelper);
			this.resourcesHelper = new ResourcesHelper(this.engine);
			this.playerActionsHelper = new PlayerActionsHelper(this.engine, this.gameState, this.resourcesHelper);
			this.upgradeEffectsHelper = new UpgradeEffectsHelper(this.playerActionsHelper);
			this.levelHelper = new LevelHelper(this.engine, this.gameState, this.playerActionsHelper);
			this.sectorHelper = new SectorHelper(this.engine);
			this.campHelper = new CampHelper(this.engine, this.upgradeEffectsHelper);
			this.playerActionResultsHelper = new PlayerActionResultsHelper(this.engine, this.gameState, this.playerActionsHelper, this.resourcesHelper, this.levelHelper, this.itemsHelper);
            this.fightHelper = new FightHelper(this.engine, this.playerActionsHelper, this.playerActionResultsHelper);
			this.movementHelper = new MovementHelper(this.engine);
			this.saveHelper = new SaveHelper();
            this.uiMapHelper = new UIMapHelper(this.engine, this.levelHelper, this.sectorHelper, this.movementHelper);
            this.buttonHelper = new ButtonHelper(this.levelHelper);
			
			// Basic building blocks & special systems
			this.tickProvider = new TickProvider(null);
			this.saveSystem = new SaveSystem(this.gameState);
			this.playerActionFunctions = new PlayerActionFunctions(
				this.gameState,
				this.resourcesHelper,
				this.levelHelper,
				this.playerActionsHelper,
				this.fightHelper,
				this.playerActionResultsHelper,
				this.playerMovedSignal,
				this.tabChangedSignal,
				this.improvementBuiltSignal);
            this.cheatSystem = new CheatSystem(this.gameState, this.playerActionFunctions, this.resourcesHelper, this.uiMapHelper);
			this.uiFunctions = new UIFunctions(this.playerActionFunctions, this.gameState, this.saveSystem, this.cheatSystem, this.calloutsGeneratedSignal);
			this.occurrenceFunctions = new OccurrenceFunctions(this.gameState, this.uiFunctions, this.resourcesHelper);
			
			this.playerActionFunctions.occurrenceFunctions = this.occurrenceFunctions;
			this.playerActionFunctions.uiFunctions = this.uiFunctions;
			this.fightHelper.uiFunctions = this.uiFunctions;
            this.playerActionsHelper.levelHelper = this.levelHelper;
            
            this.enemyHelper.createEnemies();
			
			// Systems
			this.addSystems(new EntityCreator(this.engine));
        },
	
		addSystems: function (creator) {
			this.gameManager = new GameManager(this.tickProvider, this.gameState, creator, this.uiFunctions, this.playerActionFunctions, this.saveHelper, this.enemyHelper, this.itemsHelper);
			this.engine.addSystem(this.gameManager, SystemPriorities.preUpdate);
            
            this.engine.addSystem(this.cheatSystem, SystemPriorities.update);
			
			if (GameConstants.isDebugOutputEnabled) console.log("START " + GameConstants.STARTTimeNow() + "\t initializing systems");
			
			this.engine.addSystem(this.playerActionFunctions, SystemPriorities.preUpdate);
			this.engine.addSystem(this.occurrenceFunctions, SystemPriorities.preUpdate);
			this.engine.addSystem(this.saveSystem, SystemPriorities.preUpdate);
			
			this.engine.addSystem(new GlobalResourcesResetSystem(), SystemPriorities.update);
			this.engine.addSystem(new VisionSystem(this.gameState), SystemPriorities.update);
			this.engine.addSystem(new StaminaSystem(this.gameState, this.playerActionsHelper), SystemPriorities.update);
			this.engine.addSystem(new BagSystem(this.gameState), SystemPriorities.update);
			this.engine.addSystem(new HazardSystem(), SystemPriorities.update);
			this.engine.addSystem(new CollectorSystem(this.gameState), SystemPriorities.update);
			this.engine.addSystem(new FightSystem(this.gameState, this.resourcesHelper, this.levelHelper, this.playerActionResultsHelper, this.playerActionsHelper, this.occurrenceFunctions), SystemPriorities.update);
			this.engine.addSystem(new PopulationSystem(this.gameState, this.levelHelper), SystemPriorities.update);
			this.engine.addSystem(new WorkerSystem(this.gameState, this.resourcesHelper, this.campHelper), SystemPriorities.update);
			this.engine.addSystem(new FaintingSystem(this.uiFunctions, this.playerActionFunctions, this.playerActionResultsHelper), SystemPriorities.update);
			this.engine.addSystem(new ReputationSystem(this.gameState, this.resourcesHelper), SystemPriorities.update);
			this.engine.addSystem(new RumourSystem(this.gameState, this.upgradeEffectsHelper), SystemPriorities.update);
			this.engine.addSystem(new EvidenceSystem(this.gameState, this.upgradeEffectsHelper), SystemPriorities.update);
			this.engine.addSystem(new PlayerPositionSystem(this.gameState, this.levelHelper, this.uiFunctions, this.occurrenceFunctions, this.playerMovedSignal), SystemPriorities.preupdate);
			this.engine.addSystem(new PlayerActionSystem(this.gameState, this.uiFunctions), SystemPriorities.update);
			this.engine.addSystem(new SectorStatusSystem(this.movementHelper, this.levelHelper, this.playerMovedSignal), SystemPriorities.update);
			this.engine.addSystem(new LevelPassagesSystem(this.levelHelper, this.improvementBuiltSignal), SystemPriorities.update);
			this.engine.addSystem(new UnlockedFeaturesSystem(this.gameState), SystemPriorities.update);
			this.engine.addSystem(new GlobalResourcesSystem(this.gameState, this.upgradeEffectsHelper), SystemPriorities.update);
			this.engine.addSystem(new CampEventsSystem(this.occurrenceFunctions, this.upgradeEffectsHelper, this.gameState, this.saveSystem), SystemPriorities.update);
			this.engine.addSystem(new AutoPlaySystem(this.playerActionFunctions, this.cheatSystem, this.levelHelper, this.sectorHelper, this.upgradeEffectsHelper), SystemPriorities.postUpdate);
			
			this.engine.addSystem(new UIOutHeaderSystem(this.uiFunctions, this.gameState, this.resourcesHelper, this.upgradeEffectsHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutElementsSystem(this.uiFunctions, this.gameState, this.playerActionFunctions, this.resourcesHelper, this.fightHelper, this.buttonHelper, this.calloutsGeneratedSignal), SystemPriorities.render);
			this.engine.addSystem(new UIOutLevelSystem(this.uiFunctions, this.tabChangedSignal, this.gameState, this.movementHelper, this.resourcesHelper, this.sectorHelper, this.uiMapHelper, this.playerMovedSignal), SystemPriorities.render);
			this.engine.addSystem(new UIOutCampSystem(this.uiFunctions, this.tabChangedSignal, this.gameState, this.levelHelper, this.upgradeEffectsHelper, this.campHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutEmbarkSystem(this.uiFunctions, this.tabChangedSignal, this.gameState, this.resourcesHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutBagSystem(this.uiFunctions, this.tabChangedSignal, this.playerActionsHelper, this.gameState), SystemPriorities.render);
			this.engine.addSystem(new UIOutFollowersSystem(this.uiFunctions, this.tabChangedSignal, this.gameState), SystemPriorities.render);
			this.engine.addSystem(new UIOutMapSystem(this.uiFunctions, this.tabChangedSignal, this.gameState, this.uiMapHelper, this.levelHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutUpgradesSystem(this.uiFunctions, this.tabChangedSignal, this.playerActionFunctions, this.upgradeEffectsHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutBlueprintsSystem(this.uiFunctions, this.tabChangedSignal, this.playerActionFunctions, this.upgradeEffectsHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutTribeSystem(this.uiFunctions, this.tabChangedSignal, this.resourcesHelper, this.levelHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutFightSystem(this.uiFunctions, this.playerActionResultsHelper, this.playerActionsHelper), SystemPriorities.render);
			this.engine.addSystem(new UIOutLogSystem(this.playerMovedSignal), SystemPriorities.render);
			this.engine.addSystem(new UIOutPopupInventorySystem(this.uiFunctions), SystemPriorities.render);
			this.engine.addSystem(new UIOutPopupInnSystem(this.uiFunctions, this.gameState), SystemPriorities.render);
		},
	
		start: function () {
			this.tickProvider.add(this.engine.update, this.engine);
			this.tickProvider.start();
            this.gameManager.startGame();
		},
		
		cheat: function (input) {
			this.cheatSystem.applyCheat(input);
		}
	
    });

    return Level13;
});
