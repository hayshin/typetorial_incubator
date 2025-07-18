import { Container, Graphics, HTMLText, Sprite, Text, Texture } from "pixi.js";

const defaultMessageBubbleOptions = {
  width: 200,
  maxWidth: 300,
  padding: 12,
  rightPadding: 40, // Additional padding from right side
  cornerRadius: 12,
  backgroundColor: 0x1c1d22,
  leftStrokeColor: 0xffff00, // Yellow stroke on left side
  leftStrokeWidth: 3,
  senderNameColor: 0xffffff,
  messageColor: 0xffffff,
  senderNameSize: 24,
  messageSize: 24,
  profileSize: 28,
  level: 1, // Current game level
  author: "игрок", // Message author
};

export type MessageBubbleOptions = typeof defaultMessageBubbleOptions;

// Mentor name to profile picture mapping
const MENTOR_PROFILES: Record<string, string> = {
  бернар: "main/mentors/0.JPG",
  алихан: "main/mentors/1.JPG",
  диана: "main/mentors/2.JPG",
  асель: "main/mentors/3.JPG",
  бахр: "main/mentors/4.JPG",
  баха: "main/mentors/5.JPG",
  игрок: "nfac_logo.svg",
  арман: "main/mentors/arman/0.png", 


};

/**
 * A message bubble component that looks like a social media message
 * (Telegram/Discord style with sender name and message body)
 */
export class MessageBubble extends Container {
  /** The background of the message bubble */
  public background: Graphics;
  /** The sender name text */
  private senderName: Text;
  /** The message body text */
  private messageText: HTMLText;
  /** The profile picture sprite */
  private profilePicture: Sprite;
  /** The container for the text content */
  private textContainer: Container;

  constructor(
    senderName: string,
    message: string,
    options: Partial<MessageBubbleOptions> = {},
  ) {
    super();
    const opts = { ...defaultMessageBubbleOptions, ...options };

    // Apply level-specific styling
    this.applyLevelSpecificStyling(opts, senderName);

    // Create text container
    this.textContainer = new Container();
    this.addChild(this.textContainer);

    // Create profile picture
    const profilePath =
      MENTOR_PROFILES[senderName.toLowerCase()] || "main/mentors/0.JPG";
    this.profilePicture = new Sprite(Texture.from(profilePath));
    this.profilePicture.width = opts.profileSize;
    this.profilePicture.height = opts.profileSize;
    this.profilePicture.anchor.set(0.5);
    this.profilePicture.x = opts.profileSize * 0.5 + opts.padding;
    this.profilePicture.y = opts.padding + opts.profileSize * 0.5;
    this.addChild(this.profilePicture);

    // Create circular mask for profile picture
    const profileMask = new Graphics()
      .circle(0, 0, opts.profileSize * 0.5)
      .fill({ color: 0xffffff });
    profileMask.x = this.profilePicture.x;
    profileMask.y = this.profilePicture.y;
    this.profilePicture.mask = profileMask;
    this.addChild(profileMask);

    // Create sender name (positioned to the right of profile picture)
    this.senderName = new Text({
      text: senderName,
      style: {
        fontSize: opts.senderNameSize,
        fill: opts.senderNameColor,
        fontWeight: "bold",
      },
    });
    this.senderName.anchor.x = 0;
    this.senderName.x = opts.padding; // Align with message text
    this.senderName.y = opts.padding;
    this.textContainer.addChild(this.senderName);

    // Create message text with HTML support for error highlighting
    this.messageText = new HTMLText({
      text: message,
      style: {
        fontSize: opts.messageSize,
        fill: opts.messageColor,
        wordWrap: true,
        wordWrapWidth: opts.maxWidth - opts.padding * 2 - opts.rightPadding,
      },
    });
    this.messageText.anchor.x = 0;
    this.messageText.x = opts.padding;
    this.messageText.y =
      opts.padding + Math.max(this.senderName.height, opts.profileSize) + 4;
    this.textContainer.addChild(this.messageText);

    // Calculate bubble dimensions
    const contentWidth = Math.max(
      this.senderName.x + this.senderName.width,
      this.messageText.width,
    );
    const contentHeight =
      Math.max(this.senderName.height, opts.profileSize) +
      this.messageText.height +
      8;
    const bubbleWidth = Math.min(
      contentWidth + opts.padding * 2 + opts.rightPadding,
      opts.maxWidth,
    );
    const bubbleHeight = contentHeight + opts.padding * 2;

    // Create background
    this.background = new Graphics()
      .roundRect(0, 0, bubbleWidth, bubbleHeight, opts.cornerRadius)
      .fill({ color: opts.backgroundColor });

    // Add yellow stroke on left side
    this.background
      .roundRect(0, 0, opts.leftStrokeWidth, bubbleHeight, opts.cornerRadius)
      .fill({ color: opts.leftStrokeColor });

    this.addChildAt(this.background, 0);

    // Center the text container
    this.textContainer.x = (bubbleWidth - contentWidth) * 0.5;
  }

  /**
   * Update the message content
   */
  public updateMessage(senderName: string, message: string): void {
    this.senderName.text = senderName;
    this.messageText.text = message;

    // Update profile picture if sender changed
    const profilePath =
      MENTOR_PROFILES[senderName.toLowerCase()] || "main/mentors/0.JPG";
    this.profilePicture.texture = Texture.from(profilePath);

    // Recalculate layout
    const contentWidth = Math.max(
      this.senderName.x + this.senderName.width,
      this.messageText.width,
    );

    // Update text container position
    this.textContainer.x = (this.background.width - contentWidth) * 0.5;
  }

  /**
   * Set the sender name
   */
  public setSenderName(name: string): void {
    this.senderName.text = name;

    // Update profile picture
    const profilePath =
      MENTOR_PROFILES[name.toLowerCase()] || "main/mentors/0.JPG";
    this.profilePicture.texture = Texture.from(profilePath);
  }

  /**
   * Set the message text
   */
  public setMessage(message: string): void {
    this.messageText.text = message;
  }

  /**
   * Set the message text with typing progress and error highlighting
   */
  public setMessageWithTypingProgress(
    fullMessage: string,
    typedText: string,
    hasError: boolean = false,
  ): void {
    const typedPart = typedText;
    const remainingText = fullMessage.slice(typedText.length);

    let htmlText = "";

    // Typed characters in gray
    if (typedPart.length > 0) {
      htmlText += `<span style="color: #888888">${this.escapeHtml(typedPart)}</span>`;
    }

    // Remaining text
    if (remainingText.length > 0) {
      const nextChar = remainingText[0];
      const restOfText = remainingText.slice(1);

      // Next character - red if error, yellow if normal
      const nextCharColor = hasError ? "#ff0000" : "#ffff00";
      htmlText += `<span style="color: ${nextCharColor}">${this.escapeHtml(nextChar)}</span>`;

      // Rest of the text in white
      if (restOfText.length > 0) {
        htmlText += `<span style="color: #ffffff">${this.escapeHtml(restOfText)}</span>`;
      }
    }

    this.messageText.text = htmlText;
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Set the message text with typing progress (typed characters become invisible)
   */
  public setMessageWithProgress(
    fullMessage: string,
    typedProgress: number,
  ): void {
    // Create the display text where typed characters are replaced with spaces
    const displayText = fullMessage
      .split("")
      .map((char, index) => {
        return index < typedProgress ? " " : char;
      })
      .join("");

    this.messageText.text = displayText;
  }

  /**
   * Get the bubble width
   */
  public get bubbleWidth(): number {
    return this.background.width;
  }

  /**
   * Get the bubble height
   */
  public get bubbleHeight(): number {
    return this.background.height;
  }

  /**
   * Apply level-specific styling based on game level and author
   */
  private applyLevelSpecificStyling(
    opts: MessageBubbleOptions,
    senderName: string,
  ): void {
    const level = opts.level || 1;
    const author = senderName.toLowerCase();

    // Level 2: Special styling for "асель" (speaker)
    if (level === 2 && author === "асель") {
      // Speaker-specific styling
      opts.backgroundColor = 0xff6b6b; // Red background for speaker
      opts.leftStrokeColor = 0xff0000; // Red stroke
      opts.leftStrokeWidth = 5; // Thicker stroke
      opts.cornerRadius = 20; // More rounded corners
      opts.senderNameColor = 0xffffff; // White text
      opts.messageColor = 0xffffff; // White text
      opts.senderNameSize = 28; // Larger name
      opts.messageSize = 26; // Larger message
    }

    // Level 2: Different styling for other authors
    else if (level === 2) {
      // Other authors in level 2
      opts.backgroundColor = 0x2c3e50; // Dark blue background
      opts.leftStrokeColor = 0x3498db; // Blue stroke
      opts.leftStrokeWidth = 4; // Medium stroke
      opts.cornerRadius = 15; // Medium rounded corners
    }

    // Level 1: Default styling (already set)
    // Level 3: Can add boss-specific styling here
  }
}
