import 'package:flutter/material.dart';

class ReturnRequestScreen extends StatefulWidget {
  final String orderId;
  final List<dynamic>? items;
  final double? totalAmount;

  const ReturnRequestScreen({
    super.key,
    required this.orderId,
    this.items,
    this.totalAmount,
  });

  @override
  State<ReturnRequestScreen> createState() => _ReturnRequestScreenState();
}

class _ReturnRequestScreenState extends State<ReturnRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _notesController = TextEditingController();

  final List<String> _returnReasons = [
    'المنتج تالف أو معيب مصنعياً',
    'المنتج لا يطابق المواصفات المعروضة',
    'المقاس أو الحجم غير مناسب',
    'تم استلام منتج مختلف عن المطلوب',
    'تأخر وصول الشحنة عن الموعد المحدد',
    'سبب آخر',
  ];

  String? _selectedReason;
  String _refundMethod = 'WALLET'; // WALLET, ORIGINAL_PAYMENT
  final Map<int, bool> _selectedItems = {};
  final Map<int, int> _returnQuantities = {};
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _selectedReason = _returnReasons.first;
    final itemsList = widget.items ?? [];
    for (int i = 0; i < itemsList.length; i++) {
      _selectedItems[i] = true;
      _returnQuantities[i] = (itemsList[i]['quantity'] as num?)?.toInt() ?? 1;
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _submitReturnRequest() async {
    if (!_formKey.currentState!.validate()) return;

    final selectedCount = _selectedItems.values.where((v) => v).length;
    if (selectedCount == 0 && (widget.items?.isNotEmpty ?? false)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى تحديد منتج واحد على الأقل لإرجاعه'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    // محاكاة إرسال الطلب ومعالجته عبر الخادم
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    final returnCode = "RET-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}";

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 8),
            Text('تم استلام طلب المرتجع'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('تم تسجيل طلب المرتجع للطلب #${widget.orderId} بنجاح.'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('رقم بوليصة المرتجع:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    returnCode,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.teal),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'سيتواصل معك مندوب شركة الشحن لاستلام الشحنة خلال 48 ساعة بعد مراجعة الفريق الفني.',
              style: TextStyle(fontSize: 13, color: Colors.black87),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.teal,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('حسناً، العودة للطلبات'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final itemsList = widget.items ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text('طلب إرجاع للطلب #${widget.orderId}'),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // بطاقة التنبيه بالسياسة
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: Colors.amber, size: 24),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'شروط الإرجاع: يحق لك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام شريطة أن تكون المنتجات بحالتها الأصلية غير مستخدمة وبتغليفها الأصلي.',
                      style: TextStyle(fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // قائمة المنتجات القابلة للإرجاع
            if (itemsList.isNotEmpty) ...[
              const Text(
                'اختر المنتجات المراد إرجاعها:',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...List.generate(itemsList.length, (index) {
                final item = itemsList[index];
                final maxQty = (item['quantity'] as num?)?.toInt() ?? 1;
                final isSelected = _selectedItems[index] ?? false;

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Checkbox(
                          value: isSelected,
                          activeColor: Colors.teal,
                          onChanged: (val) {
                            setState(() {
                              _selectedItems[index] = val ?? false;
                            });
                          },
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['productName'] ?? 'منتج غير مسمى',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                "السعر: \$${item['unitPrice']} | الكمية المشتراة: $maxQty",
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        if (isSelected && maxQty > 1)
                          DropdownButton<int>(
                            value: _returnQuantities[index] ?? 1,
                            items: List.generate(maxQty, (q) => q + 1)
                                .map((q) => DropdownMenuItem(value: q, child: Text("عدد: $q")))
                                .toList(),
                            onChanged: (newQ) {
                              if (newQ != null) {
                                setState(() => _returnQuantities[index] = newQ);
                              }
                            },
                          ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),
            ],

            // سبب الإرجاع
            const Text(
              'سبب الإرجاع الرئيسي:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade400),
                borderRadius: BorderRadius.circular(8),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _selectedReason,
                  items: _returnReasons
                      .map((reason) => DropdownMenuItem(value: reason, child: Text(reason)))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedReason = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // طريقة استرداد الأموال
            const Text(
              'طريقة استرداد المبلغ:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('محفظة المتجر', style: TextStyle(fontSize: 14)),
                    subtitle: const Text('فوري وبدون رسوم', style: TextStyle(fontSize: 11)),
                    value: 'WALLET',
                    groupValue: _refundMethod,
                    activeColor: Colors.teal,
                    onChanged: (v) => setState(() => _refundMethod = v!),
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('البطاقة الأصلية', style: TextStyle(fontSize: 14)),
                    subtitle: const Text('خلال 3-5 أيام عمل', style: TextStyle(fontSize: 11)),
                    value: 'ORIGINAL_PAYMENT',
                    groupValue: _refundMethod,
                    activeColor: Colors.teal,
                    onChanged: (v) => setState(() => _refundMethod = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ملاحظات إضافية وتفاصيل
            const Text(
              'ملاحظات إضافية للطلب (اختياري):',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'اكتب وصفاً أو تفاصيل إضافية عن سبب الإرجاع لمساعدة الفريق...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 24),

            // زر تأكيد الإرجاع
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _isSubmitting ? null : _submitReturnRequest,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text(
                      'تأكيد وإرسال طلب المرتجع',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
