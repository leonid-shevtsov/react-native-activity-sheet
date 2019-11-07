import { StyleSheet } from "react-native";

const BORDER_RADIUS = 13;

const actionSheetStyles = StyleSheet.create({
  pickerContainer: {
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
    overflow: "hidden"
  },
  titleContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 14
  },
  title: {
    fontSize: 13,
    textAlign: "center"
  },
  confirmButton: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 57,
    justifyContent: "center"
  },
  confirmText: {
    fontSize: 20,
    textAlign: "center"
  },
  cancelButton: {
    borderRadius: BORDER_RADIUS,
    height: 57,
    justifyContent: "center"
  },
  cancelText: {
    fontSize: 20,
    padding: 10,
    textAlign: "center",
    fontWeight: "600"
  }
});

export interface Palette {
  actionSheetBg: string;
  actionSheetCenteredBg: string;
  actionSheetUnderlay: string;
  actionSheetCancelBg: string;
  actionSheetBorder: string;
  actionSheetFg: string;
}

export const lightPalette: Palette = {
  actionSheetBg: "#EFEFEC",
  actionSheetCenteredBg: "#F6F6F0",
  actionSheetUnderlay: "#DBDBD7",
  actionSheetCancelBg: "#FFFFFF",
  actionSheetBorder: "#D7D8D4",
  actionSheetFg: "#93948D"
};

export const darkPalette: Palette = {
  actionSheetBg: "#212120",
  actionSheetCenteredBg: "#202020",
  actionSheetUnderlay: "#3E3E3E",
  actionSheetCancelBg: "#2C2C2E",
  actionSheetBorder: "#3A3939",
  actionSheetFg: "#7D7C7C"
};

export default actionSheetStyles;
