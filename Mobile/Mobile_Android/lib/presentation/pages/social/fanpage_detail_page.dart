import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/image_helper.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/social_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/snackbar_helper.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../organisms/social/post_card.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class FanpageDetailPage extends StatefulWidget {
  final int fanpageId;

  const FanpageDetailPage({super.key, required this.fanpageId});

  @override
  State<FanpageDetailPage> createState() => _FanpageDetailPageState();
}

class _FanpageDetailPageState extends State<FanpageDetailPage> {
  final SocialService _socialService = SocialService();
  final ScrollController _scrollController = ScrollController();

  Map<String, dynamic>? _fanpage;
  List<dynamic> _posts = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 50) {
      if (!_isLoadingMore && _hasMore) {
        _loadMorePosts();
      }
    }
  }

  Future<void> _fetchDetail() async {
    setState(() => _isLoading = true);
    final fanpage = await _socialService.fetchFanpageDetail(widget.fanpageId);
    final posts = await _socialService.fetchPostsByFanpage(widget.fanpageId, page: 1, limit: 10);
    
    if (mounted) {
      setState(() {
        _fanpage = fanpage;
        _posts = posts;
        if (posts.length < 10) _hasMore = false;
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMorePosts() async {
    setState(() => _isLoadingMore = true);
    _page++;
    final newPosts = await _socialService.fetchPostsByFanpage(widget.fanpageId, page: _page, limit: 10);
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

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(backgroundColor: AppColors.primary, foregroundColor: Colors.white, title: const Text('Chi tiết Fanpage')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_fanpage == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: AppColors.primary, foregroundColor: Colors.white, title: const Text('Chi tiết Fanpage')),
        body: const Center(child: Text('Không tìm thấy trang.')),
      );
    }

    final hospital = _fanpage!['hospital'];
    final coverUrl = _fanpage!['cover_image_url'];
    final avatarUrl = _fanpage!['avatar_url'];
    final followerCount = _fanpage!['follower_count'] ?? 0;
    final name = hospital?['name'] ?? _fanpage!['name'] ?? 'Bệnh viện chưa xác định';
    final city = hospital?['city'];
    final cityName = city is String ? city : city?['name'] ?? 'Việt Nam';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Text(name, style: const TextStyle(fontSize: 16)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      height: 180,
                      width: double.infinity,
                      color: Colors.grey.shade300,
                      child: coverUrl != null 
                          ? Image.network(ImageHelper.getFullUrl(coverUrl), fit: BoxFit.cover) 
                          : const Center(child: Icon(Icons.photo, size: 50, color: Colors.grey)),
                    ),
                    Positioned(
                      bottom: -40,
                      left: 16,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                        ),
                        child: CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.white,
                          backgroundImage: avatarUrl != null ? NetworkImage(ImageHelper.getFullUrl(avatarUrl)) : null,
                          child: avatarUrl == null ? const Icon(Icons.business, size: 40, color: AppColors.primary) : null,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 48),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              name,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                          ),
                          if (followerCount >= 100000)
                            const Icon(Icons.verified, color: AppColors.primary, size: 20),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Bệnh viện đa khoa hạng đặc biệt tại $cityName',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.people, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text('${followerCount.toString()} người theo dõi', style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            showAppSnackBar(context, 'Đã theo dõi (Demo)');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: const Text('Theo dõi'),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_fanpage!['description'] != null && _fanpage!['description'].toString().isNotEmpty) ...[
                        const Text('Giới thiệu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(_fanpage!['description']),
                        const SizedBox(height: 16),
                      ],
                      const Divider(),
                      const SizedBox(height: 8),
                      const Text('Bài viết', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_posts.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Center(child: Text('Chưa có bài viết nào trên trang này.', style: TextStyle(color: Colors.grey.shade500))),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  if (index == _posts.length) {
                    return _isLoadingMore 
                        ? const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))
                        : const SizedBox.shrink();
                  }

                  final post = _posts[index];
                  // Overwrite fanpage details if missing since we are on fanpage detail screen
                  post['fanpage'] ??= _fanpage;
                  return PostCardWidget(post: post, socialService: _socialService);
                },
                childCount: _posts.length + 1,
              ),
            ),
        ],
      ),
    );
  }
}



