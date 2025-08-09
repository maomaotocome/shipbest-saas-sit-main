# Website Functionality Analysis

This document provides a detailed analysis of the website's functionality, based on an examination of the source code.

## API Route Analysis

This section breaks down the functionality of the various API routes within the application.

### Object Storage (OSS)

-   **Endpoint:** `GET /api/oss/object/{objectId}`
-   **Controller:** `src/controller/oss/object/get.ts`
-   **Service:** `src/services/oss/objects/getViewInfo.ts`
-   **Functionality:** This endpoint retrieves view information for a given object ID. It requires user authentication. If the object is found, it redirects the user to the object's URL; otherwise, it returns a 404 Not Found error.

### AI Webhook

-   **Endpoint:** `POST /api/ai/webhook/fal/{taskId}/{subTaskId}/{resultType}`
-   **Controller:** `src/controller/ai/webhook/fal/index.ts`
-   **Service:** `src/services/tasks/aigc/providers/fal.ts`
-   **Functionality:** This endpoint handles webhooks from the `fal.ai` service. It verifies the webhook signature to ensure the request is legitimate. If the signature is valid, it processes the webhook data based on the task ID, sub-task ID, and result type, and then returns a JSON response.

### User Authentication (Auth)

-   **Endpoint:** `GET /api/auth/[...nextauth]` and `POST /api/auth/[...nextauth]`
-   **Library:** `next-auth`
-   **Configuration:** `src/lib/auth/index.ts`
-   **Functionality:** This set of endpoints handles user authentication using the `next-auth` library. It supports various authentication providers, including Google (with One-Tap support) and email-based magic links (via Resend or Nodemailer). It uses a custom Prisma adapter to connect to the database and manages user sessions with JWTs.

### Billing

-   **Endpoint:** `POST /api/billing/payment/webhook/stripe/{accountCode}`
-   **Controller:** `src/controller/billing/stripe/webhook/index.ts`
-   **Service:** `src/services/billing/payment/providers/stripe/webhook/eventHandlerRouter.ts`
-   **Functionality:** This endpoint handles webhooks from Stripe. It processes incoming events based on the account code, verifies the request signature, and routes the event to the appropriate handler. This is crucial for managing subscription status, payment confirmations, and other billing-related events.

### AI Playground

The AI Playground provides a suite of APIs for interacting with AI models and managing user-generated content.

-   **Chat:**
    -   **Endpoint:** `POST /api/playground/chat` and `DELETE /api/playground/chat`
    -   **Controller:** `src/controller/playground/chat/index.ts`
    -   **Service:** `src/services/playground/chat.ts`
    -   **Functionality:**
        -   `POST`: Handles chat requests. It requires authentication and takes a chat ID, messages, and the selected chat model as input. It returns a streaming response with the AI's output.
        -   `DELETE`: Deletes a chat session. It requires authentication and the chat ID.

-   **Documents:**
    -   **Endpoint:** `GET /api/playground/document`, `POST /api/playground/document`, and `PATCH /api/playground/document`
    -   **Controller:** `src/controller/playground/document/index.ts`
    -   **Service:** `src/services/playground/document.ts`
    -   **Functionality:**
        -   `GET`: Retrieves a document by its ID.
        -   `POST`: Creates a new document with a given title, content, and kind.
        -   `PATCH`: Updates the timestamp of a document.

-   **History:**
    -   **Endpoint:** `GET /api/playground/history`
    -   **Controller:** `src/controller/playground/history/index.ts`
    -   **Service:** `src/services/playground/history.ts`
    -   **Functionality:** Retrieves the user's chat history with pagination support.

-   **Suggestions:**
    -   **Endpoint:** `GET /api/playground/suggestions`
    -   **Controller:** `src/controller/playground/suggestions/index.ts`
    -   **Service:** `src/services/playground/suggestions.ts`
    -   **Functionality:** Fetches suggestions for a given document ID.

-   **Voting:**
    -   **Endpoint:** `GET /api/playground/vote` and `PATCH /api/playground/vote`
    -   **Controller:** `src/controller/playground/vote/index.ts`
    -   **Service:** `src/services/playground/vote.ts`
    -   **Functionality:**
        -   `GET`: Retrieves the vote status for a given chat message.
        -   `PATCH`: Allows users to upvote or downvote a message.

## Frontend Page Analysis

This section breaks down the functionality of the various frontend pages.

### Static Pages

These pages are located in the `src/app/(front)/(nolocale)` directory and do not require localization.

-   **About:**
    -   **Route:** `/about`
    -   **Component:** `src/components/pages/about/index.tsx`
    -   **Functionality:** Displays a simple "About" page. Currently a placeholder.

-   **Contact:**
    -   **Route:** `/contact`
    -   **Component:** `src/components/pages/contact/index.tsx`
    -   **Functionality:** Displays a simple "Contact" page. Currently a placeholder.

-   **Privacy Policy:**
    -   **Route:** `/privacy-policy`
    -   **Component:** `src/components/pages/privacy-policy/index.tsx`
    -   **Functionality:** Displays the privacy policy. The content is hardcoded as a Markdown string and rendered using `next-mdx-remote`.

-   **Terms and Conditions:**
    -   **Route:** `/terms-and-conditions`
    -   **Component:** `src/components/pages/terms-and-conditions/index.tsx`
    -   **Functionality:** Displays the terms and conditions. The content is hardcoded as a Markdown string and rendered using `next-mdx-remote`.

### AI Feature Pages

These pages are located in the `src/app/(front)/[locale]/(default)/(ai)` directory and provide the core AI generation features.

-   **Explore:**
    -   **Route:** `/explore`
    -   **Component:** `src/components/pages/ai/explore/index.tsx`
    -   **Functionality:**  A placeholder page, likely intended for showcasing user-generated content or featured models.

-   **Text to Image:**
    -   **Route:** `/image/text-to-image`
    -   **Component:** `src/components/pages/ai/image/text-to-image/index.tsx`
    -   **Functionality:** This page provides a user interface for generating images from a text prompt. It is composed of a `Hero` component and a `Pricing` component.
        -   **Hero Component (`src/components/sections/ai/image/text-to-image/hero/index.tsx`):** This component is the main user interface for the text-to-image feature. It wraps the `ModelDirectInvoker` component.
        -   **ModelDirectInvoker Component (`src/components/toolpanel/aigc/models.tsx`):** This is a highly reusable and configurable component that handles the core logic for interacting with AI models.
            -   **Model Selection:** Allows users to select from a list of available text-to-image models.
            -   **Dynamic Parameter Inputs:** Dynamically renders UI elements (sliders, text inputs, etc.) for the parameters of the selected model.
            -   **Task Creation:** Creates a new task in the backend when the user initiates image generation.
            -   **Validation:** Validates user input and checks for authentication and sufficient credits before creating the task.
            -   **Privacy Control:** Allows users to set the privacy of their generated images.
            -   **Credit Cost Display:** Shows the user the estimated credit cost for the generation task.
            -   **Result Display:** Displays the generated images in a list or carousel.

-   **Image to Image:**
    -   **Route:** `/image/image-to-image`
    -   **Component:** `src/components/pages/ai/image/image-to-image/index.tsx`
    -   **Functionality:** This page provides a user interface for generating images from an input image and a text prompt. It is composed of a `Hero` component and a `Pricing` component.
        -   **Hero Component (`src/components/sections/ai/image/image-to-image/hero/index.tsx`):** This component is the main user interface for the image-to-image feature. It wraps the `ModelDirectInvoker` component.
        -   **ModelDirectInvoker Component (`src/components/toolpanel/aigc/models.tsx`):** This component is reused from the text-to-image feature, but it is configured for the `image-to-image` model category. This means it will display different models and parameters, including an image upload field.

-   **Text to Video:**
    -   **Route:** `/video/text-to-video`
    -   **Component:** `src/components/pages/ai/video/text-to-video/index.tsx`
    -   **Functionality:** This page provides a user interface for generating videos from a text prompt. It is composed of a `Hero` component and a `Pricing` component.
        -   **Hero Component (`src/components/sections/ai/video/text-to-video/hero/index.tsx`):** This component is the main user interface for the text-to-video feature. It wraps the `ModelDirectInvoker` component.
        -   **ModelDirectInvoker Component (`src/components/toolpanel/aigc/models.tsx`):** This component is reused from the text-to-image feature, but it is configured for the `text-to-video` model category. This means it will display different models and parameters, and the result will be a video.

-   **Image to Video:**
    -   **Route:** `/video/image-to-video`
    -   **Component:** `src/components/pages/ai/video/image-to-video/index.tsx`
    -   **Functionality:** Provides a user interface for generating videos from an input image and a text prompt. Includes a `Hero` section for the main UI and a `Pricing` section.

-   **Anime Template:**
    -   **Route:** `/image/template/anime`
    -   **Component:** `src/components/pages/ai/template/anime/index.tsx`
    -   **Functionality:** A specialized version of the text-to-image feature, specifically for creating anime-style images. Includes a `Hero` section for the main UI and a `Pricing` section.

### Core Public Pages

These pages are located in the `src/app/(front)/[locale]/(default)` directory and are accessible to all users.

-   **Home:**
    -   **Route:** `/`
    -   **Component:** `src/components/pages/home/index.tsx`
    -   **Functionality:** The main landing page of the website. It is composed of many different sections, including a hero banner, a showcase of generated content, feature highlights, customer testimonials, a carousel, FAQs, usage examples, the latest blog posts, and pricing information.

-   **Pricing:**
    -   **Route:** `/pricing`
    -   **Component:** `src/components/pages/pricing/index.tsx`
    -   **Functionality:** Displays the pricing plans for the service.

-   **Blog:**
    -   **Route:** `/blog`
    -   **Component:** `src/components/pages/blog/index.tsx`
    -   **Functionality:** A comprehensive blog section that can display a list of all blog posts, posts filtered by category or tag, or a single blog post. It uses `unstable_cache` for performance optimization by caching database queries.

### Admin Workspace

This section is located in the `src/app/(front)/[locale]/(workspace)/admin` directory and provides a comprehensive set of tools for managing the application.

-   **Dashboard:**
    -   **Route:** `/admin`
    -   **Component:** `src/components/pages/admin/home/index.tsx`
    -   **Functionality:** The main dashboard for administrators, providing an overview of the application and navigation to other admin sections.

-   **Users:**
    -   **Route:** `/admin/users`
    -   **Component:** `src/components/pages/admin/users/index.tsx`
    -   **Functionality:** Allows administrators to view, search, and manage users.

-   **Billing Management:**
    -   **Plans:**
        -   **Route:** `/admin/billing/plans`
        -   **Component:** `src/components/pages/admin/billing/plans/index.tsx`
        -   **Functionality:** Create, edit, and manage subscription plans.
    -   **Subscriptions:**
        -   **Route:** `/admin/billing/subscriptions`
        -   **Component:** `src/components/pages/admin/billing/subscriptions/index.tsx`
        -   **Functionality:** View and manage user subscriptions, including cancellation.
    -   **Purchases:**
        -   **Route:** `/admin/billing/purchases`
        -   **Component:** `src/components/pages/admin/billing/purchases/index.tsx`
        -   **Functionality:** View and refund user purchases.
    -   **Invoices:**
        -   **Route:** `/admin/billing/invoice`
        -   **Component:** `src/components/pages/admin/billing/invoice/index.tsx`
        -   **Functionality:** View and search for user invoices.
    -   **Affiliates:**
        -   **Route:** `/admin/billing/affiliates`
        -   **Component:** `src/components/pages/admin/billing/affiliates/index.tsx`
        -   **Functionality:** (Coming Soon) A page for managing affiliate partners.
    -   **Payment Providers:**
        -   **Route:** `/admin/billing/payment-providers`
        -   **Component:** `src/components/pages/admin/billing/payment-providers/index.tsx`
        -   **Functionality:** Configure and manage payment gateways like Stripe.

-   **Blog Management:**
    -   **Posts:**
        -   **Route:** `/admin/blog/posts`
        -   **Component:** `src/components/pages/admin/blog/posts/index.tsx`
        -   **Functionality:** Create, edit, and manage blog posts.
    -   **Categories:**
        -   **Route:** `/admin/blog/categories`
        -   **Component:** `src/components/pages/admin/blog/categories/index.tsx`
        -   **Functionality:** Manage blog post categories.
    -   **Tags:**
        -   **Route:** `/admin/blog/tags`
        -   **Component:** `src/components/pages/admin/blog/tags/index.tsx`
        -   **Functionality:** Manage blog post tags.

-   **Notifications:**
    -   **Route:** `/admin/notifications`
    -   **Component:** `src/components/pages/admin/notifications/index.tsx`
    -   **Functionality:** Create and send notifications to users.

-   **Object Storage (OSS):**
    -   **Route:** `/admin/oss`
    -   **Component:** `src/components/pages/admin/oss/buckets/index.tsx`
    -   **Functionality:** Manage object storage buckets.

-   **Settings:**
    -   **Route:** `/admin/settings`
    -   **Component:** `src/components/pages/admin/settings/index.tsx`
    -   **Functionality:** (Placeholder) A page for administrative settings.

### User Workspace

This section is located in the `src/app/(front)/[locale]/(workspace)/user` directory and provides users with tools to manage their account and activities.

-   **Dashboard:**
    -   **Route:** `/user`
    -   **Component:** `src/components/pages/user/home/index.tsx`
    -   **Functionality:** The main dashboard for users, providing an overview of their account and navigation to other user sections.

-   **Profile:**
    -   **Route:** `/user/profile`
    -   **Component:** `src/components/pages/user/profile/index.tsx`
    -   **Functionality:** Allows users to update their password.

-   **Subscriptions:**
    -   **Route:** `/user/subscriptions`
    -   **Component:** `src/components/pages/user/subscriptions/index.tsx`
    -   **Functionality:** View and manage personal subscriptions.

-   **Purchases:**
    -   **Route:** `/user/purchases`
    -   **Component:** `src/components/pages/user/purchases/index.tsx`
    -   **Functionality:** View a history of all purchases.

-   **Invoices:**
    -   **Route:** `/user/invoices`
    -   **Component:** `src/components/pages/user/invoices/index.tsx`
    -   **Functionality:** View and download invoices.

-   **Credits:**
    -   **Route:** `/user/credits`
    -   **Component:** `src/components/pages/user/credits/index.tsx`
    -   **Functionality:** View credit balance, grants, and transaction history.

-   **Affiliates:**
    -   **Route:** `/user/affiliates`
    -   **Component:** `src/components/pages/user/affiliates/index.tsx`
    -   **Functionality:** (Coming Soon) A page for users to manage their affiliate status.

-   **Teams:**
    -   **Route:** `/user/teams`
    -   **Component:** `src/components/pages/user/teams/index.tsx`
    -   **Functionality:** (Placeholder) A page for managing teams.

-   **Notifications:**
    -   **Route:** `/user/notifications`
    -   **Component:** `src/components/pages/user/notifications/index.tsx`
    -   **Functionality:** View personalized and system notifications.

-   **Settings:**
    -   **Route:** `/user/settings`
    -   **Component:** `src/components/pages/user/settings/index.tsx`
    -   **Functionality:** (Placeholder) A page for user-specific settings.

-   **Order:**
    -   **Route:** `/user/order`
    -   **Component:** `src/components/pages/user/order/index.tsx`
    -   **Functionality:** Handles the payment process for new orders.

-   **Thanks:**
    -   **Route:** `/user/thanks`
    -   **Component:** `src/components/pages/user/thanks/index.tsx`
    -   **Functionality:** A thank you page displayed after a successful order, with order status polling.

-   **Security:**
    -   **Route:** `/user/security`
    -   **Component:** `src/components/pages/user/security/index.tsx`
    -   **Functionality:** (Placeholder) A page for user security settings.
