import 'package:flutter/material.dart';
import '../../../service/social_service.dart';
import '../../../logics/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import '../../../core/utils/snackbar_helper.dart';
import '../../pages/social/fanpage_detail_page.dart';
import '../../../core/utils/text_utils.dart';
import '../../../core/utils/image_helper.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class PostCardWidget extends StatefulWidget {
  final dynamic post;
  final SocialService socialService;

  const PostCardWidget({super.key, required this.post, required this.socialService});

  @override
  State<PostCardWidget> createState() => _PostCardWidgetState();
}

class _PostCardWidgetState extends State<PostCardWidget> {
  bool _isLiked = false;
  int _likesCount = 0;
  int _commentsCount = 0;

  @override
  void initState() {
    super.initState();
    _likesCount = widget.post['likes_count'] ?? 0;
    _commentsCount = widget.post['comments_count'] ?? 0;
    _checkLike();
  }

  Future<void> _checkLike() async {
    final isLiked = await widget.socialService.checkLikeStatus(widget.post['id']);
    if (mounted) {
      setState(() {
        _isLiked = isLiked;
      });
    }
  }

  Future<void> _handleLike() async {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      showAppSnackBar(context, 'Bạn cần đăng nhập để like');
      return;
    }
    setState(() {
      _isLiked = !_isLiked;
      _likesCount += _isLiked ? 1 : -1;
    });
    final success = await widget.socialService.likePost(widget.post['id']);
    if (!success && mounted) {
      setState(() {
        _isLiked = !_isLiked;
        _likesCount += _isLiked ? 1 : -1;
      });
      showAppSnackBar(context, 'Like không thành công');
    }
  }

  void _showComments() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _CommentsSheet(postId: widget.post['id'], socialService: widget.socialService),
    );
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GestureDetector(
              onTap: () {
                if (post['hospital'] != null && post['hospital']['id'] != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => FanpageDetailPage(fanpageId: post['hospital']['id']),
                    ),
                  );
                }
              },
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primaryLight,
                    backgroundImage: (post['hospital'] != null && post['hospital']['logo_url'] != null && post['hospital']['logo_url'].toString().isNotEmpty)
                        ? NetworkImage(ImageHelper.getFullUrl(post['hospital']['logo_url']))
                        : null,
                    child: (post['hospital'] == null || post['hospital']['logo_url'] == null || post['hospital']['logo_url'].toString().isEmpty)
                        ? const Icon(Icons.business, color: AppColors.primary)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post['hospital'] != null ? (post['hospital']['name'] ?? 'Bệnh viện') : 'Bệnh viện chưa xác định',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          'Vừa xong',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (post['title'] != null && post['title'].toString().isNotEmpty) ...[
              Text(TextUtils.stripHtml(post['title'].toString()), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 4),
            ],
            Text(TextUtils.stripHtml(post['content']?.toString() ?? '')),
            if (post['image_url'] != null && post['image_url'].toString().isNotEmpty) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(ImageHelper.getFullUrl(post['image_url']), fit: BoxFit.cover),
              ),
            ],
            const SizedBox(height: 12),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                TextButton.icon(
                  onPressed: _handleLike,
                  icon: Icon(
                    _isLiked ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
                    color: _isLiked ? AppColors.primary : Colors.grey,
                  ),
                  label: Text('$_likesCount Thích'),
                ),
                TextButton.icon(
                  onPressed: _showComments,
                  icon: const Icon(Icons.comment_outlined, color: Colors.grey),
                  label: Text('$_commentsCount Bình luận'),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}

class _CommentsSheet extends StatefulWidget {
  final int postId;
  final SocialService socialService;

  const _CommentsSheet({required this.postId, required this.socialService});

  @override
  State<_CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<_CommentsSheet> {
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




