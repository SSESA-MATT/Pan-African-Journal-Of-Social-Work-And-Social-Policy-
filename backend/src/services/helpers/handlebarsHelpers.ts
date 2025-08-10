import handlebars from 'handlebars';

/**
 * Register Handlebars helpers for use in email templates
 */
export const registerHandlebarsHelpers = () => {
  // Format date helper
  handlebars.registerHelper('formatDate', function(date: Date | string, format: string = 'full') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'year':
        return dateObj.getFullYear().toString();
      case 'month-year':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      default:
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    }
  });

  // Conditional helper
  handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: any) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });

  // String case helper
  handlebars.registerHelper('capitalizeFirst', function(str: string) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // List formatter helper
  handlebars.registerHelper('formatList', function(items: string[]) {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    
    const lastItem = items[items.length - 1];
    const restItems = items.slice(0, items.length - 1).join(', ');
    return `${restItems}, and ${lastItem}`;
  });

  // URL helper
  handlebars.registerHelper('urlEncode', function(str: string) {
    return encodeURIComponent(str);
  });
};
