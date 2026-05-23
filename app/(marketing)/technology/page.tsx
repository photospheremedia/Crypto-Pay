'use client';

import { motion } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  BarChart3, 
  Utensils,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TECHNOLOGY_SERVICES, SUPPORTED_PLATFORMS } from '@/types/urban-piper';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const services = [
  {
    id: 'delivery-integration',
    icon: Monitor,
    title: 'Delivery Integration Suite',
    subtitle: 'Manage all platforms in one place',
    description: 'Consolidate orders from DoorDash, UberEats, Grubhub, and more into a single dashboard. Never miss an order again.',
    features: [
      'Unified order management',
      'Real-time order alerts',
      'Automatic menu sync',
      'Inventory management',
      'Performance analytics',
      'Multi-location support',
    ],
    stats: [
      { value: '40%', label: 'Less missed orders' },
      { value: '2hrs', label: 'Saved daily' },
      { value: '15%', label: 'Revenue increase' },
    ],
    cta: 'Schedule Demo',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'custom-ordering',
    icon: Smartphone,
    title: 'Custom Online Ordering',
    subtitle: 'Your brand, your website',
    description: 'Launch your own branded ordering website with zero commission on orders. Build direct relationships with your customers.',
    features: [
      'Custom branded website',
      'Zero commission orders',
      'Built-in loyalty program',
      'Marketing automation',
      'Mobile optimized',
      'Integrated payments',
    ],
    stats: [
      { value: '0%', label: 'Commission fees' },
      { value: '25%', label: 'More repeat orders' },
      { value: '3x', label: 'Customer data' },
    ],
    cta: 'See Examples',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Insights',
    subtitle: 'Data-driven decisions',
    description: 'Understand your business with detailed analytics across all sales channels. Optimize menu, pricing, and operations.',
    features: [
      'Cross-platform reporting',
      'Menu performance tracking',
      'Peak hour analysis',
      'Customer insights',
      'Revenue forecasting',
      'Competitor benchmarking',
    ],
    stats: [
      { value: '360°', label: 'Business view' },
      { value: '50+', label: 'Data points' },
      { value: 'Live', label: 'Reporting' },
    ],
    cta: 'Learn More',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'menu-management',
    icon: Utensils,
    title: 'Menu Management',
    subtitle: 'Update once, sync everywhere',
    description: 'Manage your menu from one place. Update items, prices, and availability across all platforms instantly.',
    features: [
      'Single menu source',
      'Instant sync to all platforms',
      'Item availability control',
      'Price management',
      'Photo library',
      'Modifier management',
    ],
    stats: [
      { value: '1', label: 'Dashboard' },
      { value: '10+', label: 'Platforms' },
      { value: 'Instant', label: 'Updates' },
    ],
    cta: 'Get Started',
    color: 'from-orange-500 to-red-500',
  },
];

const deliveryPlatforms = Object.entries(SUPPORTED_PLATFORMS)
  .filter(([_, p]) => p.available)
  .map(([key, platform]) => ({
    key,
    ...platform,
  }));

const benefits = [
  {
    icon: Zap,
    title: 'Quick Setup',
    description: 'Get up and running in days, not weeks. Our team handles everything.',
  },
  {
    icon: Shield,
    title: 'Reliable & Secure',
    description: 'Enterprise-grade infrastructure with 99.9% uptime guarantee.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Real humans available whenever you need help.',
  },
  {
    icon: Users,
    title: 'Dedicated Manager',
    description: 'Your personal success manager to optimize your operations.',
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: 'Trusted by thousands of restaurants worldwide.',
  },
  {
    icon: Layers,
    title: 'Bundled Savings',
    description: 'Combine with supplies for exclusive discounts.',
  },
];

export default function TechnologySolutionsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20" />
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              Technology Solutions for Restaurants
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Streamline Your
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Restaurant Operations
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Manage all your delivery platforms, online orders, and analytics from one powerful dashboard. 
              Less chaos, more orders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90">
                Schedule Free Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Watch How It Works
              </Button>
            </div>
          </motion.div>
          
          {/* Platform logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16"
          >
            <p className="text-center text-white/50 text-sm mb-6">
              Integrates with all major delivery platforms
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {deliveryPlatforms.slice(0, 6).map((platform, i) => (
                <motion.div
                  key={platform.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-white/90 font-medium">{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Complete Technology Suite
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage and grow your restaurant business
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                
                <div className="p-8">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.color} bg-opacity-10 mb-6`}>
                    <service.icon className="w-6 h-6 text-slate-800" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4">
                    {service.subtitle}
                  </p>
                  <p className="text-slate-600 mb-6">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-6 py-4 border-t border-slate-100 mb-6">
                    {service.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className={`w-full bg-gradient-to-r ${service.color} text-white border-0 group-hover:shadow-lg transition-shadow`}>
                    {service.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Restaurants Choose Us
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              More than just software — we&apos;re your technology partner
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="flex gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of restaurants already using our technology suite. 
              Get a free demo and see the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90">
                Schedule Free Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
            
            <p className="mt-6 text-white/50 text-sm">
              No commitment required • Free setup assistance • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
