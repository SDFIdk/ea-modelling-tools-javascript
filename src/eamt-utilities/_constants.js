/**
 * @file This file contains constants used by EA or Windows. Taken from EAConstants-JScript in Local Scripts.
 */

/*
 * Prompt types for Session.Prompt().
 */
var promptOK						= 1;
var promptYESNO						= 2;
var promptYESNOCANCEL				= 3;
var promptOKCANCEL					= 4;

/*
 * Prompt results from Session.Prompt().
 */
var resultOK						= 1;
var resultCancel					= 2;
var resultYes						= 3;
var resultNo						= 4;

/*
 * ObjectType
 */
var otNone 							= 0;
var otProject 						= 1;
var otRepository 					= 2;
var otCollection 					= 3;
var otElement 						= 4;
var otPackage 						= 5;
var otModel 						= 6;
var otConnector 					= 7;
var otDiagram 						= 8;
var otRequirement 					= 9;
var otScenario 						= 10;
var otConstraint 					= 11;
var otTaggedValue 					= 12;
var otFile 							= 13;
var otEffort 						= 14;
var otMetric 						= 15;
var otIssue 						= 16;
var otRisk 							= 17;
var otTest 							= 18;
var otDiagramObject 				= 19;
var otDiagramLink 					= 20;
var otResource 						= 21;
var otConnectorEnd 					= 22;
var otAttribute 					= 23;
var otMethod 						= 24;
var otParameter 					= 25;
var otClient 						= 26;
var otAuthor 						= 27;
var otDatatype 						= 28;
var otStereotype 					= 29;
var otTask 							= 30;
var otTerm 							= 31;
var otProjectIssues 				= 32;
var otAttributeConstraint 			= 33;
var otAttributeTag 					= 34;
var otMethodConstraint 				= 35;
var otMethodTag 					= 36;
var otConnectorConstraint 			= 37;
var otConnectorTag 					= 38;
var otProjectResource 				= 39;
var otReference 					= 40;
var otRoleTag						= 41;
var otCustomProperty 				= 42;
var otPartition 					= 43;
var otTransition 					= 44;
var otEventProperty 				= 45;
var otEventProperties 				= 46;
var otPropertyType 					= 47;
var otProperties 					= 48;
var otProperty 						= 49;
var otSwimlaneDef 					= 50;
var otSwimlanes 					= 51;
var otSwimlane 						= 52;
var otModelWatcher 					= 53;
var otScenarioStep 					= 54;
var otScenarioExtension 			= 55;
var otParamTag						= 56;
var	otProjectRole					= 57;
var otDocumentGenerator				= 58;
var otMailInterface					= 59;


/*
 * layout style (for the 2nd argument of Repository.GetProjectInterface().LayoutDiagramEx()),
 * see also https://sparxsystems.com/eahelp/layoutadiagram.html
 * and https://sparxsystems.com/eahelp/constlayoutstylesenum.htm
 */
var lsDiagramDefault                = 0x00000000; // Use existing layout options specified for this diagram.
var lsProgramDefault                = 0xFFFFFFFF; // Use factory default layout options as specified by Enterprise Architect.
var lsCycleRemoveGreedy             = 0x80000000; // Use the Greedy Cycle Removal algorithm.
var lsCycleRemoveDFS                = 0x40000000; // Use the Depth First Cycle Removal algorithm.
var lsLayeringLongestPathSink       = 0x30000000; // Layer the diagram using the Longest Path Sink algorithm.
var lsLayeringLongestPathSource     = 0x20000000; // Layer the diagram using the Longest Path Source algorithm.
var lsLayeringOptimalLinkLength     = 0x10000000; // Layer the diagram using the Optimal Link Length algorithm.
var lsInitializeNaive               = 0x08000000; // Initialize the layout using the Naive Initialize Indices algorithm.
var lsInitializeDFSOut              = 0x04000000; // Initialize the layout using the Depth First Search Outward algorithm.
var lsInitializeDFSIn               = 0x0C000000; // Initialize the layout using the Depth First Search Inward algorithm.
var lsCrossReduceAggressive         = 0x02000000; // Perform aggressive Cross-reduction in the layout process (time consuming).
var lsLayoutDirectionUp             = 0x00010000; // Direct connectors to point up.
var lsLayoutDirectionDown           = 0x00020000; // Direct connectors to point down.
var lsLayoutDirectionLeft           = 0x00040000; // Direct connectors to point left.
var lsLayoutDirectionRight          = 0x00080000; // Direct connectors to point right.

/*
 * Possible values returned from the GetRelationSet method of the Element object,
 * see https://sparxsystems.com/eahelp/enumrelationsettypeenum.htm
 */
var rsGeneralizeStart = 0; // List of elements that the current element generalizes.
var rsGeneralizeEnd   = 1; // List of elements that are generalized by the current element.
var rsRealizeStart    = 2; // List of elements that the current element realizes.
var rsRealizeEnd      = 3; // List of elements that are realized by the current element.
var rsDependStart     = 4; // List of elements that the current element depends on.
var rsDependEnd       = 5; // List of elements that depend on the current element.
var rsParents         = 6; // List of all parent elements of the current element.
