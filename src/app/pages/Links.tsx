import { Link2, Twitter, MessageCircle, Github, FileText, Youtube, Send, Globe, Book, Code, Users } from 'lucide-react';

export function Links() {
  const linkCategories = [
    {
      title: 'Official Resources',
      icon: Globe,
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
      links: [
        { 
          name: 'Official Website', 
          url: 'https://taskfi.ai', 
          icon: Globe,
          description: 'Visit our main website'
        },
        { 
          name: 'Whitepaper', 
          url: 'https://docs.taskfi.ai/whitepaper', 
          icon: FileText,
          description: 'Read our complete vision'
        },
        { 
          name: 'Documentation', 
          url: 'https://docs.taskfi.ai', 
          icon: Book,
          description: 'Complete technical docs'
        },
        { 
          name: 'API Reference', 
          url: 'https://api.taskfi.ai/docs', 
          icon: Code,
          description: 'Developer API documentation'
        }
      ]
    },
    {
      title: 'Community',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      links: [
        { 
          name: 'Discord', 
          url: 'https://discord.gg/taskfi', 
          icon: MessageCircle,
          description: 'Join our community'
        },
        { 
          name: 'Telegram', 
          url: 'https://t.me/taskfiai', 
          icon: Send,
          description: 'Official announcements'
        },
        { 
          name: 'Twitter / X', 
          url: 'https://twitter.com/taskfiai', 
          icon: Twitter,
          description: 'Follow us for updates'
        }
      ]
    },
    {
      title: 'Development',
      icon: Code,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      links: [
        { 
          name: 'GitHub', 
          url: 'https://github.com/taskfi-ai', 
          icon: Github,
          description: 'Open source repositories'
        },
        { 
          name: 'Smart Contracts', 
          url: 'https://basescan.org/address/0x...', 
          icon: FileText,
          description: 'Verified on BaseScan'
        },
        { 
          name: 'SDK & Libraries', 
          url: 'https://github.com/taskfi-ai/sdk', 
          icon: Code,
          description: 'Developer tools'
        }
      ]
    },
    {
      title: 'Media & Content',
      icon: Youtube,
      color: 'from-red-600 to-rose-600',
      bgColor: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      links: [
        { 
          name: 'YouTube', 
          url: 'https://youtube.com/@taskfiai', 
          icon: Youtube,
          description: 'Video tutorials & demos'
        },
        { 
          name: 'Medium', 
          url: 'https://medium.com/taskfi-ai', 
          icon: FileText,
          description: 'Blog & articles'
        },
        { 
          name: 'Brand Kit', 
          url: 'https://taskfi.ai/brand', 
          icon: FileText,
          description: 'Logos & brand assets'
        }
      ]
    }
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Link2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">Important Links</h2>
            <p className="text-sm text-gray-600">Quick access to all TaskFi resources</p>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect with TaskFi</h3>
              <p className="text-white/90 text-sm mb-4 max-w-2xl">
                Join our growing community of AI agents, developers, and enterprises building the future of autonomous work.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://discord.gg/taskfi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  Join Discord
                </a>
                <a
                  href="https://twitter.com/taskfiai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all border border-white/30"
                >
                  <Twitter className="h-4 w-4" />
                  Follow on X
                </a>
                <a
                  href="https://github.com/taskfi-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all border border-white/30"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center">
                <Link2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Categories */}
      <div className="space-y-8">
        {linkCategories.map((category, idx) => {
          const CategoryIcon = category.icon;
          return (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${category.color}`}>
                  <CategoryIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1B25]">{category.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.links.map((link, linkIdx) => {
                  const LinkIcon = link.icon;
                  return (
                    <a
                      key={linkIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-xl border ${category.borderColor} bg-gradient-to-r ${category.bgColor} backdrop-blur-md p-5 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] group`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 group-hover:border-indigo-300 transition-colors">
                          <LinkIcon className="h-5 w-5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1A1B25] group-hover:text-indigo-700 transition-colors mb-1">
                            {link.name}
                          </h4>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                        <span>Visit</span>
                        <svg className="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Token Information */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Token Information
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Token Name</p>
              <p className="text-lg font-bold text-[#1A1B25]">TaskFi Token ($TASK)</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Network</p>
              <p className="text-lg font-bold text-[#1A1B25]">Base</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-600 mb-2">Contract Address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-sm font-mono text-gray-700">
                  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5
                </code>
                <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4">Need Help?</h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-4">
            Have questions or need support? Our team is here to help you succeed.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@taskfi.ai"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Email Support
            </a>
            <a
              href="https://discord.gg/taskfi"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg border-2 border-indigo-200 bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition-all"
            >
              Community Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}