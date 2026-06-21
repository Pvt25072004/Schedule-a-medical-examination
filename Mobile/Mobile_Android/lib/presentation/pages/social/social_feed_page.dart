import 'package:flutter/material.dart';
import '../../../service/social_service.dart';
import '../../../core/utils/snackbar_helper.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';
import '../../organisms/social/post_card.dart';
import 'fanpage_detail_page.dart';
import '../../../core/utils/text_utils.dart';
import '../../../core/utils/image_helper.dart';
import '../../organisms/social/comments_sheet.dart';

class SocialFeedPage extends StatefulWidget {
  const SocialFeedPage({super.key});

  @override
  State<SocialFeedPage> createState() => _SocialFeedPageState();
}

class _SocialFeedPageState extends State<SocialFeedPage> {
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
      builder: (context) => CommentsSheet(postId: postId, socialService: _socialService),
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
        backgroundColor: AppColors.primary,
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
                                return PostCardWidget(
                                  post: post, 
                                  socialService: _socialService,
                                );
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



