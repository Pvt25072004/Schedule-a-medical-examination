import 'package:flutter/material.dart';
import '../service/social_service.dart';
import '../utils/snackbar_helper.dart';
import '../service/auth_service.dart';

class SocialFeedScreen extends StatefulWidget {
  const SocialFeedScreen({super.key});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final SocialService _socialService = SocialService();
  final ScrollController _scrollController = ScrollController();
  
  List<dynamic> _posts = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadPosts();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 50) {
      if (!_isLoadingMore && _hasMore) {
        _loadMorePosts();
      }
    }
  }

  Future<void> _loadPosts() async {
    setState(() {
      _isLoading = true;
      _page = 1;
      _hasMore = true;
    });
    final posts = await _socialService.fetchPosts(page: _page, limit: 10);
    if (mounted) {
      setState(() {
        _posts = posts;
        _isLoading = false;
        if (posts.length < 10) _hasMore = false;
      });
    }
  }

  Future<void> _loadMorePosts() async {
    setState(() => _isLoadingMore = true);
    _page++;
    final newPosts = await _socialService.fetchPosts(page: _page, limit: 10);
    if (mounted) {
      setState(() {
        if (newPosts.isEmpty) {
          _hasMore = false;
        } else {
          _posts.addAll(newPosts);
          if (newPosts.length < 10) _hasMore = false;
        }
        _isLoadingMore = false;
      });
    }
  }

  Future<void> _handleLike(int index, int postId) async {
    if (AuthService.accessToken == null) {
      showAppSnackBar(context, 'Bạn cần đăng nhập để like');
      return;
    }
    
    // Optimistic update
    setState(() {
      _posts[index]['isLiked'] = true;
      _posts[index]['likesCount'] = (_posts[index]['likesCount'] ?? 0) + 1;
    });

    final success = await _socialService.likePost(postId);
    if (!success) {
      // Revert if failed
      if (mounted) {
        setState(() {
          _posts[index]['isLiked'] = false;
          _posts[index]['likesCount'] = (_posts[index]['likesCount'] ?? 1) - 1;
        });
        showAppSnackBar(context, 'Like không thành công');
      }
    }
  }

  void _showComments(int postId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _CommentsSheet(postId: postId, socialService: _socialService),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cộng đồng Y tế'),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPosts,
              child: ListView.builder(
                controller: _scrollController,
                itemCount: _posts.length + 1,
                itemBuilder: (context, index) {
                  if (index == _posts.length) {
                    return _isLoadingMore
                        ? const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))
                        : const SizedBox.shrink();
                  }
                  
                  final post = _posts[index];
                  final isLiked = post['isLiked'] ?? false;
                  
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: Colors.green.shade100,
                                child: const Icon(Icons.business, color: Colors.green),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      post['fanpage']?['name'] ?? 'Fanpage',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
                          const SizedBox(height: 12),
                          Text(post['content'] ?? ''),
                          if (post['image_url'] != null && post['image_url'].toString().isNotEmpty) ...[
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(post['image_url'], fit: BoxFit.cover),
                            ),
                          ],
                          const SizedBox(height: 12),
                          const Divider(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              TextButton.icon(
                                onPressed: () => _handleLike(index, post['id']),
                                icon: Icon(
                                  isLiked ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
                                  color: isLiked ? Colors.green : Colors.grey,
                                ),
                                label: Text('${post['likesCount'] ?? 0} Thích'),
                              ),
                              TextButton.icon(
                                onPressed: () => _showComments(post['id']),
                                icon: const Icon(Icons.comment_outlined, color: Colors.grey),
                                label: const Text('Bình luận'),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
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
                  icon: const Icon(Icons.send, color: Colors.green),
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
