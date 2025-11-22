
from playwright.sync_api import sync_playwright

def verify_landing_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 2400}  # Tall viewport to see full landing page
        )
        page = context.new_page()

        try:
            # Navigate to the local dev server
            page.goto("http://localhost:3000")

            # Wait for key elements to ensure page is loaded
            page.wait_for_selector('h1')
            page.wait_for_selector('text=Digital Dukan')

            # Take a full page screenshot
            page.screenshot(path="/home/jules/verification/landing_page_final.png", full_page=True)
            print("Screenshot taken: /home/jules/verification/landing_page_final.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_landing_page()
