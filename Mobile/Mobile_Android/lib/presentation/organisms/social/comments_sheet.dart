import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/social_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/snackbar_helper.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class CommentsSheet extends StatefulWidget {
  final int postId;
  final SocialService socialService;

  const CommentsSheet({super.key, required this.postId, required this.socialService});

  @override
  State<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<CommentsSheet> {
  List<dynamic> _comments = [];
  bool _isLoading = true;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadComments();
  }

  Future<void> _loadComments() async {
    final comments = await widget.socialService.fetchComments(widget.postId);
    if (mounted) {
      setState(() {
        _comments = comments;
        _isLoading = false;
      });
    }
  }

  Future<void> _sendComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    _commentController.clear();
    final success = await widget.socialService.commentPost(widget.postId, text);
    if (success) {
      _loadComments();
    } else {
      showAppSnackBar(context, 'Bình luận thất bại');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.6,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Bình luận', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Divider(),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _comments.isEmpty
                      ? const Center(child: Text('Chưa có bình luận nào.'))
                      : ListView.builder(
                          itemCount: _comments.length,
                          itemBuilder: (context, index) {
                            final c = _comments[index];
                            return ListTile(
                              leading: const CircleAvatar(child: Icon(Icons.person)),
                              title: Text(c['user']?['full_name'] ?? 'Ẩn danh', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              subtitle: Text(c['content'] ?? ''),
                            );
                          },
                        ),
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: 'Viết bình luận...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: AppColors.primary),
                  onPressed: _sendComment,
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}


