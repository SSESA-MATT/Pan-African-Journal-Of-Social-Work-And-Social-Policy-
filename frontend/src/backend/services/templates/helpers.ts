import handlebars from 'handlebars';

// Helper to format dates
handlebars.registerHelper('formatDate', function(date, format) {
  const dateObj = new Date(date);
  
  type DateFormatOptions = {
    year: 'numeric' | '2-digit';
    month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day: 'numeric' | '2-digit';
  };
  
  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    'short': { year: 'numeric', month: 'short', day: 'numeric' },
    'long': { year: 'numeric', month: 'long', day: 'numeric' },
    'month-year': { year: 'numeric', month: 'long' }
  };
  
  return dateObj.toLocaleDateString('en-US', formats[format as string] || formats.long);
});

// Helper for conditional equality
handlebars.registerHelper('if_eq', function(this: any, a, b, opts) {
  if (a === b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// Helper for current year
handlebars.registerHelper('current_year', function() {
  return new Date().getFullYear();
});

// Helper to convert newlines to <br> tags
handlebars.registerHelper('nl2br', function(text) {
  if (!text) return '';
  const escaped = handlebars.Utils.escapeExpression(text);
  return new handlebars.SafeString(escaped.replace(/(\r\n|\n|\r)/gm, '<br>'));
});

// Helper for truncating text
handlebars.registerHelper('truncate', function(text, length) {
  if (!text) return '';
  const parsedLength = parseInt(length as string, 10) || 100;
  
  if (text.length <= parsedLength) {
    return text;
  }
  return text.substring(0, parsedLength) + '...';
});

// Helper for capitalizing text
handlebars.registerHelper('capitalize', function(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
});

// Helper to format status for display
handlebars.registerHelper('formatStatus', function(status) {
  if (!status) return '';
  
  const statusMap: Record<string, string> = {
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'revisions_required': 'Revisions Required',
    'accepted': 'Accepted',
    'rejected': 'Rejected'
  };
  
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
});
