import 'package:flutter_test/flutter_test.dart';
import 'package:bhumi_shield/main.dart';

void main() {
  testWidgets('BhumiShieldFieldApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BhumiShieldFieldApp());
    expect(find.text('BHUMI-SHIELD'), findsWidgets);
  });
}
