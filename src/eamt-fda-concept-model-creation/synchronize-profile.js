!INC eamt-fda-concept-models._fda-concept-model-constants

/**
 * Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile using the
 * [`Repository.SynchProfile()` method](https://www.sparxsystems.com/search/sphider/search.php?query=synchprofile&type=and&category=User+Guide+Latest&tab=5&search=1).
 *
 * @summary Synchronizes the tagged values of the Concept and ConceptModel stereotypes of the FDA profile
 */
function main() {
	Repository.SynchProfile(PROFILENAME, STEREOTYPE_CONCEPTMODEL);
	Repository.SynchProfile(PROFILENAME, STEREOTYPE_CONCEPT);
	Repository.RefreshModelView(0);
}

main();