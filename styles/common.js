import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.greenMedium,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.greenLight,
    fontStyle: 'italic',
  },
});