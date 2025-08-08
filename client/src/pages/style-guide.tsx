import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Check, 
  X, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  Upload,
  Download,
  Settings,
  User,
  FileText,
  Globe
} from 'lucide-react';

export default function StyleGuide() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-card-foreground mb-4">
          Alpha's AI Translation Portal
        </h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
          UI Design Style Guide
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete design system and component guidelines for maintaining consistency 
          across the Alpha's AI Translation Portal interface.
        </p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Palette
              </CardTitle>
              <CardDescription>
                Primary colors and semantic color definitions for the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-20 bg-[#16173f] rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Primary</p>
                      <p className="text-muted-foreground">#16173f</p>
                      <p className="text-xs text-muted-foreground">Main brand color, navigation, primary actions</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-20 bg-[#ee3667] rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Accent</p>
                      <p className="text-muted-foreground">#ee3667</p>
                      <p className="text-xs text-muted-foreground">Highlights, important CTAs, alerts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-20 bg-[#5f55a4] rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Hover State</p>
                      <p className="text-muted-foreground">#5f55a4</p>
                      <p className="text-xs text-muted-foreground">Interactive element hover effects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-green-100 dark:bg-green-900/30 rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Success</p>
                      <p className="text-muted-foreground">Complete, Success</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-amber-100 dark:bg-amber-900/30 rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Warning</p>
                      <p className="text-muted-foreground">Pending, In Progress</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-red-100 dark:bg-red-900/30 rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Error</p>
                      <p className="text-muted-foreground">Failed, Critical</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg border"></div>
                    <div className="text-sm">
                      <p className="font-medium">Info</p>
                      <p className="text-muted-foreground">Information, Neutral</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Text Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-card-foreground rounded"></div>
                    <div>
                      <p className="font-medium text-card-foreground">Primary Text</p>
                      <p className="text-sm text-muted-foreground">Main content, headings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted-foreground rounded"></div>
                    <div>
                      <p className="font-medium text-muted-foreground">Secondary Text</p>
                      <p className="text-sm text-muted-foreground">Supporting text, labels</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography Scale
              </CardTitle>
              <CardDescription>
                Hierarchy and sizing for text elements throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Heading 1</h1>
                  <p className="text-sm text-muted-foreground">4xl, font-bold - Page titles, main headings</p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold mb-2">Heading 2</h2>
                  <p className="text-sm text-muted-foreground">3xl, font-semibold - Section headings</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Heading 3</h3>
                  <p className="text-sm text-muted-foreground">2xl, font-semibold - Subsection headings</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Heading 4</h4>
                  <p className="text-sm text-muted-foreground">xl, font-semibold - Component headings</p>
                </div>
                <div>
                  <h5 className="text-lg font-medium mb-2">Heading 5</h5>
                  <p className="text-sm text-muted-foreground">lg, font-medium - Card titles</p>
                </div>
                <div>
                  <p className="text-base mb-2">Body Text</p>
                  <p className="text-sm text-muted-foreground">base - Default body text</p>
                </div>
                <div>
                  <p className="text-sm mb-2">Small Text</p>
                  <p className="text-sm text-muted-foreground">sm - Captions, metadata</p>
                </div>
                <div>
                  <p className="text-xs mb-2">Extra Small</p>
                  <p className="text-sm text-muted-foreground">xs - Fine print, timestamps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Component Library
              </CardTitle>
              <CardDescription>
                Standard components and their usage patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              <Separator />

              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Success</Badge>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>
                </div>
              </div>

              <Separator />

              {/* Form Elements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Input Field</label>
                      <Input placeholder="Enter text here..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Textarea</label>
                      <Textarea placeholder="Enter longer text here..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="checkbox" />
                      <label htmlFor="checkbox" className="text-sm font-medium">
                        Checkbox option
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Progress Bar</label>
                      <Progress value={65} className="w-full" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alerts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Alerts</h3>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      This is an informational alert with useful details.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-400">Warning</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      This is a warning alert that requires attention.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 dark:text-red-400">Error</AlertTitle>
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      This is an error alert indicating a problem.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spacing System</CardTitle>
              <CardDescription>
                Consistent spacing scale using Tailwind's spacing tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">1 (4px)</span>
                      <span className="text-sm text-muted-foreground">Minimal spacing</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">2 (8px)</span>
                      <span className="text-sm text-muted-foreground">Small spacing</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">3 (12px)</span>
                      <span className="text-sm text-muted-foreground">Medium spacing</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">4 (16px)</span>
                      <span className="text-sm text-muted-foreground">Default spacing</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">6 (24px)</span>
                      <span className="text-sm text-muted-foreground">Large spacing</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-6 bg-primary"></div>
                      <span className="font-mono text-sm">8 (32px)</span>
                      <span className="text-sm text-muted-foreground">Section spacing</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Usage Guidelines</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>1-2:</strong> Internal component spacing (padding between icon and text)</p>
                    <p><strong>3-4:</strong> Component internal spacing (card padding, form field gaps)</p>
                    <p><strong>6:</strong> Component external spacing (margins between cards)</p>
                    <p><strong>8+:</strong> Section spacing (major layout gaps)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Patterns</CardTitle>
              <CardDescription>
                Common interface patterns and their implementations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Card Layouts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Basic Card
                      </CardTitle>
                      <CardDescription>
                        Standard card with title and description
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Content goes here with consistent padding and spacing.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:bg-[#5f55a4] hover:text-white transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Interactive Card
                      </CardTitle>
                      <CardDescription>
                        Card with hover effects for clickable content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Hover over this card to see the interaction effect.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Navigation Patterns</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Primary Navigation:</strong> Dark background (#16173f) with white text</p>
                  <p><strong>Active States:</strong> Accent color (#ee3667) for current page</p>
                  <p><strong>Hover States:</strong> Subtle highlight with custom purple (#5f55a4)</p>
                  <p><strong>Role-based Access:</strong> Admin-only items clearly separated</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Progress</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Complete</Badge>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consistent color coding across all status displays
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Guidelines</CardTitle>
              <CardDescription>
                Best practices and principles for maintaining design consistency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Do's and Don'ts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Do's
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Use the established color palette consistently</li>
                      <li>• Maintain proper spacing using the scale</li>
                      <li>• Use semantic color meanings (green for success, red for errors)</li>
                      <li>• Ensure sufficient contrast for accessibility</li>
                      <li>• Use hover states for interactive elements</li>
                      <li>• Keep interface patterns consistent across pages</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Don'ts
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Don't use arbitrary colors outside the palette</li>
                      <li>• Don't mix different spacing scales randomly</li>
                      <li>• Don't use red for non-error states</li>
                      <li>• Don't overcrowd interfaces with too many elements</li>
                      <li>• Don't ignore hover/focus states</li>
                      <li>• Don't create one-off component variations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Color Contrast:</strong> Ensure WCAG AA compliance (4.5:1 ratio minimum)</p>
                  <p><strong>Focus States:</strong> All interactive elements must have visible focus indicators</p>
                  <p><strong>Semantic HTML:</strong> Use proper heading hierarchy and ARIA labels</p>
                  <p><strong>Touch Targets:</strong> Minimum 44px for mobile touch targets</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Performance</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Animations:</strong> Use CSS transitions for smooth interactions</p>
                  <p><strong>Loading States:</strong> Provide feedback during async operations</p>
                  <p><strong>Progressive Enhancement:</strong> Ensure base functionality without JavaScript</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}