function getActiveLegendTitle() {
	var titleText = indComboBox.getDisplayValue();
	if (!titleText) {
		return "Kein Thema";
		}
	var year = yearComboBox.getValue();
	if (year) {
		titleText = titleText + " (" + year + ")";
		}
		
	return titleText;
	
}