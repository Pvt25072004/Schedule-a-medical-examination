import 'package:carousel_slider/carousel_slider.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:flutter/material.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class BannerCarousel extends StatefulWidget {
  final List<dynamic> banners;
  final double screenWidth;
  final Color primaryColor;

  const BannerCarousel({
    super.key,
    required this.banners,
    required this.screenWidth,
    required this.primaryColor,
  });

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  int _currentBannerIndex = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) return const SizedBox.shrink();

    return Stack(
      children: [
        CarouselSlider(
          options: CarouselOptions(
            height: 140,
            autoPlay: widget.banners.length > 1,
            autoPlayInterval: const Duration(seconds: 3),
            enlargeCenterPage: true,
            enableInfiniteScroll: widget.banners.length > 1,
            viewportFraction: 0.95,
            onPageChanged: (index, reason) =>
                setState(() => _currentBannerIndex = index),
          ),
          items: widget.banners.map((banner) {
            return Builder(
              builder: (BuildContext context) {
                final String imgUrl = (banner['image_url'] ?? '').toString();
                return Container(
                  width: widget.screenWidth,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: Colors.grey[200],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (imgUrl.isNotEmpty)
                        Image.network(
                          imgUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) =>
                              const Icon(Icons.image_not_supported, size: 50),
                        )
                      else
                        const Icon(Icons.image_not_supported, size: 50),
                      // Gradient overlay
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 60,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                Colors.black.withOpacity(0.7)
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ),
                      // Title
                      Positioned(
                        bottom: 20, // Nâng lên để nhường chỗ cho dots
                        left: 16,
                        right: 16,
                        child: Text(
                          banner['title'] ?? 'Khuyến mãi đặc biệt',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          }).toList(),
        ),
        // Dots
        Positioned(
          bottom: 8,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: widget.banners.asMap().entries.map((entry) {
              return Container(
                width: 8.0,
                height: 8.0,
                margin: const EdgeInsets.symmetric(horizontal: 4.0),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentBannerIndex == entry.key
                      ? widget.primaryColor: Colors.white.withOpacity(0.5),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}




