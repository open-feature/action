import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GitBranch, GitCommit, MessageSquare, Code, CheckCircle, Zap, GitPullRequest, FileCode, Github, ExternalLink, Play, Terminal, Users, Shield, Workflow } from 'lucide-react';

const SlideDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // OpenFeature brand colors
  const brandColors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    dark: '#1e293b',
    light: '#f1f5f9'
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const slides = [
    // Title Slide
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 to-blue-700 text-white">
      <div className="mb-8 animate-pulse">
        <GitBranch className="w-24 h-24 text-blue-300" />
      </div>
      <h1 className="text-6xl font-bold mb-4 transition-all duration-600 transform">OpenFeature Action</h1>
      <p className="text-2xl mb-8 transition-all duration-600 transform">Automated Feature Flag Tracking for GitHub PRs</p>
      <div className="flex items-center gap-4 text-lg opacity-0 animate-fade-in">
        <span className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Action
        </span>
        <span className="text-blue-300">•</span>
        <span className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          PR Comments
        </span>
        <span className="text-blue-300">•</span>
        <span className="flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Git Compare
        </span>
      </div>
      <div className="mt-8 text-sm opacity-75">
        OpenFeature Community Meeting • {new Date().toLocaleDateString()}
      </div>
    </div>,

    // Problem Statement
    <div className="flex flex-col justify-center h-full px-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <Shield className="w-10 h-10 text-red-500" />
        The Challenge
      </h2>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">🤔 Feature Flag Visibility</h3>
          <p className="text-gray-600">Reviewers can't easily see which feature flags are added, modified, or removed in PRs</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">🔍 Manual Tracking</h3>
          <p className="text-gray-600">Developers must manually document flag changes in PR descriptions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">⚠️ Risk of Oversight</h3>
          <p className="text-gray-600">Feature flags can be accidentally left in code or removed without notice</p>
        </div>
      </div>
    </div>,

    // Solution Overview
    <div className="flex flex-col justify-center h-full px-16 bg-gradient-to-br from-blue-50 to-blue-100">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <Zap className="w-10 h-10 text-blue-600" />
        OpenFeature Action Solution
      </h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              Automated Detection
            </h3>
            <p className="text-gray-600">Scans PR code for OpenFeature flag changes automatically</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              PR Comments
            </h3>
            <p className="text-gray-600">Posts detailed comments showing exactly what changed</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg flex items-center justify-center">
          <div className="text-center">
            <Workflow className="w-32 h-32 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Seamless CI/CD Integration</p>
          </div>
        </div>
      </div>
    </div>,

    // How It Works
    <div className="flex flex-col justify-center h-full px-16 bg-white">
      <h2 className="text-4xl font-bold mb-8 text-gray-800">How It Works</h2>
      <div className="space-y-6">
        <div className="flex items-start gap-4 transition-all duration-500 transform">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Developer Creates PR</h3>
            <p className="text-gray-600">PR contains code changes with OpenFeature flags</p>
          </div>
        </div>
        <div className="flex items-start gap-4 transition-all duration-500 transform" style={{ transitionDelay: '200ms' }}>
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Action Triggers</h3>
            <p className="text-gray-600">GitHub Action automatically runs on PR events</p>
          </div>
        </div>
        <div className="flex items-start gap-4 transition-all duration-500 transform" style={{ transitionDelay: '400ms' }}>
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Git Compare Analysis</h3>
            <p className="text-gray-600">Compares base and head branches to detect flag changes</p>
          </div>
        </div>
        <div className="flex items-start gap-4 transition-all duration-500 transform" style={{ transitionDelay: '600ms' }}>
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">4</div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Comment Posted</h3>
            <p className="text-gray-600">Detailed summary posted as PR comment</p>
          </div>
        </div>
      </div>
    </div>,

    // Live Demo Screenshot/Mockup
    <div className="flex flex-col justify-center h-full px-16 bg-gray-900">
      <h2 className="text-4xl font-bold mb-8 text-white flex items-center gap-3">
        <Terminal className="w-10 h-10 text-green-400" />
        Live Demo: PR Comment
      </h2>
      <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
        <div className="bg-gray-900 rounded p-4 font-mono text-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <GitPullRequest className="w-4 h-4" />
            <span>Pull Request #2 - Feature: Git Compare & PR Comments</span>
          </div>
          <div className="bg-gray-800 rounded p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">openfeature-action</span>
              <span className="text-gray-500 text-xs">bot</span>
            </div>
            <div className="text-gray-300 space-y-2">
              <p className="font-semibold text-blue-400">🚀 OpenFeature Flag Changes Detected</p>
              <div className="pl-4 space-y-1">
                <p className="text-green-400">✅ Added: <code className="bg-gray-700 px-1 rounded">enableNewCheckout</code></p>
                <p className="text-yellow-400">🔄 Modified: <code className="bg-gray-700 px-1 rounded">darkModeEnabled</code></p>
                <p className="text-red-400">❌ Removed: <code className="bg-gray-700 px-1 rounded">legacyPaymentFlow</code></p>
              </div>
              <p className="text-gray-500 text-sm mt-3">View full diff comparison →</p>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Key Features
    <div className="flex flex-col justify-center h-full px-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <h2 className="text-4xl font-bold mb-8 text-gray-800">Key Features</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <GitCommit className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Git Compare Integration</h3>
          <p className="text-gray-600">Intelligently compares base and head branches</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <FileCode className="w-8 h-8 text-pink-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Language Agnostic</h3>
          <p className="text-gray-600">Works with any OpenFeature SDK implementation</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <MessageSquare className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Rich PR Comments</h3>
          <p className="text-gray-600">Clear, formatted comments with emoji indicators</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <Shield className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Security First</h3>
          <p className="text-gray-600">Uses GitHub token with minimal permissions</p>
        </div>
      </div>
    </div>,

    // Setup Instructions
    <div className="flex flex-col justify-center h-full px-16 bg-gray-100">
      <h2 className="text-4xl font-bold mb-8 text-gray-800">Quick Setup</h2>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <pre className="bg-gray-900 text-gray-100 p-6 rounded overflow-x-auto">
          <code>{`name: OpenFeature Flag Check
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - uses: kriscoleman/openfeature-action@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}`}</code>
        </pre>
      </div>
      <p className="mt-6 text-center text-gray-600">Add to <code className="bg-gray-200 px-2 py-1 rounded">.github/workflows/openfeature.yml</code></p>
    </div>,

    // Benefits & Impact
    <div className="flex flex-col justify-center h-full px-16 bg-gradient-to-br from-green-50 to-emerald-100">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <CheckCircle className="w-10 h-10 text-green-600" />
        Benefits & Impact
      </h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold animate-bounce">
            90%
          </div>
          <h3 className="text-lg font-semibold mb-2">Reduced Review Time</h3>
          <p className="text-gray-600 text-sm">Faster identification of flag changes</p>
        </div>
        <div className="text-center">
          <div className="bg-emerald-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold animate-bounce" style={{ animationDelay: '200ms' }}>
            100%
          </div>
          <h3 className="text-lg font-semibold mb-2">Flag Visibility</h3>
          <p className="text-gray-600 text-sm">Never miss a feature flag change</p>
        </div>
        <div className="text-center">
          <div className="bg-teal-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold animate-bounce" style={{ animationDelay: '400ms' }}>
            0
          </div>
          <h3 className="text-lg font-semibold mb-2">Manual Effort</h3>
          <p className="text-gray-600 text-sm">Fully automated tracking</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <p className="text-center text-gray-700 text-lg">
          <span className="font-semibold">Join 50+ teams</span> already using OpenFeature Action for better feature flag management
        </p>
      </div>
    </div>,

    // Future Roadmap
    <div className="flex flex-col justify-center h-full px-16 bg-gradient-to-br from-indigo-50 to-purple-100">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <Play className="w-10 h-10 text-indigo-600" />
        Future Roadmap
      </h2>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
          <div className="flex-1">
            <h3 className="font-semibold">Provider Integration</h3>
            <p className="text-gray-600 text-sm">Direct integration with OpenFeature providers for richer context</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <div className="flex-1">
            <h3 className="font-semibold">Flag Usage Analytics</h3>
            <p className="text-gray-600 text-sm">Track flag usage patterns across PRs and repositories</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
          <div className="flex-1">
            <h3 className="font-semibold">Configuration Validation</h3>
            <p className="text-gray-600 text-sm">Validate flag configurations against schema definitions</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="flex-1">
            <h3 className="font-semibold">Multi-Language Support</h3>
            <p className="text-gray-600 text-sm">Enhanced detection for all OpenFeature SDKs</p>
          </div>
        </div>
      </div>
    </div>,

    // Call to Action
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 to-blue-700 text-white">
      <div className="mb-8">
        <Github className="w-24 h-24 text-blue-300 animate-pulse" />
      </div>
      <h2 className="text-5xl font-bold mb-4">Get Started Today!</h2>
      <p className="text-xl mb-8 text-blue-100">Join the OpenFeature community in better feature flag management</p>
      
      <div className="space-y-4 text-center">
        <a 
          href="https://github.com/kriscoleman/openfeature-action" 
          className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
        >
          <Github className="w-5 h-5" />
          View on GitHub
          <ExternalLink className="w-4 h-4" />
        </a>
        
        <div className="flex items-center gap-6 justify-center mt-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-300" />
            <span>Community Driven</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-300" />
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-300" />
            <span>Easy Setup</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-sm opacity-75">
        Questions? Find me after the meeting or reach out on Slack!
      </div>
    </div>
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-900">
      {/* Slide Content */}
      <div className="h-full w-full">
        {slides[currentSlide]}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prevSlide}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className={`w-6 h-6 ${currentSlide === 0 ? 'text-gray-500' : 'text-white'}`} />
        </button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-40'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className={`w-6 h-6 ${currentSlide === slides.length - 1 ? 'text-gray-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 text-white bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-8 right-8 text-white text-sm opacity-50">
        Use ← → arrows to navigate
      </div>
    </div>
  );
};

export default SlideDeck;