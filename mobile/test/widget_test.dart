import 'package:flutter_test/flutter_test.dart';
import 'package:bhumi_shield/main.dart';

void main() {
  testWidgets('BhumiShieldMobileApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BhumiShieldMobileApp());
    expect(find.text('BHUMI-SHIELD'), findsWidgets);
  });
}
