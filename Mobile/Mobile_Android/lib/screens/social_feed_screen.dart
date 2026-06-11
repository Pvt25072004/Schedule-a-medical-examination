import 'package:flutter/material.dart';
import '../service/social_service.dart';
import '../utils/snackbar_helper.dart';
import '../service/auth_service.dart';
import '../widgets/post_card.dart';
import 'fanpage_detail_screen.dart';
import '../utils/text_utils.dart';
import '../utils/image_helper.dart';

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

  bool _isSearching = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPosts();
    _scrollController.addListener(_onScroll);
  }

  List<dynamic> get _filteredPosts {
    if (_searchQuery.trim().isEmpty) return _posts;
    final q = _searchQuery.toLowerCase();
    return _posts.where((post) {
      final title = TextUtils.stripHtml((post['title'] ?? '').toString()).toLowerCase();
      final content = TextUtils.stripHtml((post['content'] ?? '').toString()).toLowerCase();
      final hospitalName = (post['hospital']?['name'] ?? '').toString().toLowerCase();
      return title.contains(q) || content.contains(q) || hospitalName.contains(q);
    }).toList();
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
    final searchResults = _filteredPosts;
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: _isSearching 
            ? TextField(
                controller: _searchController,
                autofocus: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Tìm hashtag, fanpage, bài viết...',
                  hintStyle: TextStyle(color: Colors.white70),
                  border: InputBorder.none,
                ),
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              )
            : const Text('Cộng đồng Y tế'),
        backgroundColor: const Color(0xFF48A1F3),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _searchController.clear();
                  _searchQuery = '';
                }
                _isSearching = !_isSearching;
              });
            },
          )
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : searchResults.isEmpty
                        ? const Center(child: Text('Không tìm thấy bài viết nào.'))
                        : RefreshIndicator(
                            onRefresh: _loadPosts,
                            child: ListView.builder(
                              controller: _scrollController,
                              itemCount: _isSearching ? searchResults.length : (_posts.length + 1),
                              itemBuilder: (context, index) {
                                if (!_isSearching && index == _posts.length) {
                                  return _isLoadingMore
                                      ? const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))
                                      : const SizedBox.shrink();
                                }
                                final post = _isSearching ? searchResults[index] : _posts[index];
                                return PostCardWidget(post: post, socialService: _socialService);
                              },
                        ),
                ),
              )
              ],
            ),
          ],
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
                  icon: const Icon(Icons.send, color: Color(0xFF48A1F3)),
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
