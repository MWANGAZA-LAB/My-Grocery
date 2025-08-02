import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring function
const sendToAnalytics = (metric: any) => {
  // In a production app, you would send this to your analytics service
  console.log('Performance Metric:', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });

  // Example: Send to Google Analytics
  // gtag('event', metric.name, {
  //   event_category: 'Web Vitals',
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_label: metric.id,
  //   non_interaction: true,
  // });
};

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Enhanced performance monitoring
export function initPerformanceMonitoring() {
  // Monitor Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Monitor navigation timing
  if ('navigation' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('Navigation Timing:', {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      serverResponse: navigation.responseEnd - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
    });
  }

  // Monitor resource loading
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        console.log('Resource Timing:', {
          name: resourceEntry.name,
          duration: resourceEntry.duration,
          size: resourceEntry.transferSize,
          type: resourceEntry.initiatorType,
        });
      }
    });
  });

  if ('observe' in observer) {
    observer.observe({ entryTypes: ['resource'] });
  }
}
