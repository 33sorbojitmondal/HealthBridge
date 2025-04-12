'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { forumPosts, filterPosts, type ForumPost, type ForumReply } from '@/lib/data/forum-data';

export default function CommunityForum() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>(forumPosts);
  
  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(forumPosts.flatMap(post => post.tags))
  ).sort();

  const handleSearch = () => {
    const results = filterPosts(searchQuery, tagFilter === 'all' ? undefined : tagFilter);
    setFilteredPosts(results);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTagFilter('all');
    setFilteredPosts(forumPosts);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get badge color based on user role
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'health_professional':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Community Health Forum</h1>
          <p className="text-gray-600 mb-8">
            Connect with healthcare professionals and community members to discuss health topics and get advice.
          </p>

          {/* Search and Filter Section */}
          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Find Discussions</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Search by topic, keyword, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="md:w-1/3">
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <option value="all">All Topics</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md whitespace-nowrap"
                >
                  Search
                </button>
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-md text-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* New Post Button */}
          <div className="mb-8 flex justify-end">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center">
              <span className="mr-2">+</span>
              <span>Start a New Discussion</span>
            </button>
          </div>

          {/* Forum Posts */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Discussion' : 'Discussions'} Found
            </h2>
            
            {filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <div key={post.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <div className="p-4 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                onClick={() => {
                                  setTagFilter(tag);
                                  handleSearch();
                                }}
                              >
                                {tag.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(post.timestamp)}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {post.content.length > 200 
                          ? `${post.content.substring(0, 200)}...` 
                          : post.content
                        }
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {post.author.avatar && (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <Image 
                                src={post.author.avatar} 
                                alt={post.author.name}
                                width={32}
                                height={32}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{post.author.name}</div>
                            <div className="text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${getRoleBadgeClass(post.author.role)}`}>
                                {post.author.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">
                            <span className="font-medium text-green-600">{post.replies.length}</span> replies
                          </span>
                          <span>
                            <span className="font-medium text-green-600">{post.likes}</span> likes
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Display the first reply if it exists and is verified */}
                    {post.replies.length > 0 && post.replies.some(reply => reply.verified) && (
                      <div className="bg-gray-50 p-4 border-t">
                        <div className="flex items-start mb-2">
                          <div className="flex items-center">
                            {(() => {
                              const verifiedReply = post.replies.find(reply => reply.verified);
                              if (!verifiedReply) return null;
                              
                              return (
                                <>
                                  {verifiedReply.author.avatar && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                      <Image 
                                        src={verifiedReply.author.avatar} 
                                        alt={verifiedReply.author.name}
                                        width={24}
                                        height={24}
                                      />
                                    </div>
                                  )}
                                  <div className="text-sm font-medium mr-2">{verifiedReply.author.name}</div>
                                  <div className="text-xs">
                                    <span className={`px-2 py-0.5 rounded-full ${getRoleBadgeClass(verifiedReply.author.role)}`}>
                                      {verifiedReply.author.role.replace('_', ' ')}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {(() => {
                            const verifiedReply = post.replies.find(reply => reply.verified);
                            if (!verifiedReply) return null;
                            
                            const content = verifiedReply.content;
                            return content.length > 150 
                              ? `${content.substring(0, 150)}...` 
                              : content;
                          })()}
                        </p>
                        <div className="text-right">
                          <span className="text-sm text-green-600 font-medium cursor-pointer">
                            Read full discussion →
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-2">No discussions match your search criteria.</p>
                <p className="text-gray-500">Try adjusting your filters or start a new discussion.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 