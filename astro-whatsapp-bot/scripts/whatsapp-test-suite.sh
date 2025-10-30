#!/bin/bash

# WhatsApp Bot Test Suite
# Comprehensive testing script for WhatsApp Business API integration
# Reads configuration from .env file instead of hardcoding values

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables from .env file
load_env() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ Error: .env file not found. Please create it with your WhatsApp configuration.${NC}"
        exit 1
    fi

    # Source the .env file
    set -a
    source .env
    set +a

    # Validate required variables
    if [ -z "$W1_WHATSAPP_ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ Error: W1_WHATSAPP_ACCESS_TOKEN not found in .env file${NC}"
        exit 1
    fi

    if [ -z "$W1_WHATSAPP_PHONE_NUMBER_ID" ]; then
        echo -e "${RED}❌ Error: W1_WHATSAPP_PHONE_NUMBER_ID not found in .env file${NC}"
        exit 1
    fi

    # Set default recipient if not provided
    RECIPIENT_PHONE="${RECIPIENT_PHONE:-+971544972975}"
}

# Display usage information
usage() {
    echo -e "${BLUE}WhatsApp Bot Test Suite${NC}"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  test-message          Send a test message to verify API connectivity"
    echo "  trigger-menu          Send 'Menu' to trigger bot's main menu"
    echo "  interactive-menu      Send interactive menu with buttons"
    echo "  send-hi               Send 'Hi' greeting to bot"
    echo "  send-help             Send 'Help' command to bot"
    echo "  menu-command          Send menu command to bot"
    echo "  validate-token        Validate WhatsApp access token"
    echo "  all                   Run all tests sequentially"
    echo "  help                  Show this help message"
    echo ""
    echo "Options:"
    echo "  -p, --phone PHONE     Phone number to send messages to (default: +971544972975)"
    echo "  -v, --verbose         Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 test-message"
    echo "  $0 trigger-menu -p +1234567890"
    echo "  $0 all --verbose"
}

# Send a test message
send_test_message() {
    echo -e "${BLUE}📤 Sending test message...${NC}"
    echo "From: +15551428384"
    echo "To: $RECIPIENT_PHONE"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "text": {
                "body": "Hello! This is a test message from your Astro Bot. 🌟 How can I help you today? Try asking for your daily horoscope or birth chart analysis!"
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Test message sent successfully!${NC}"
        echo "Message ID: $(echo $response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    else
        echo -e "${RED}❌ Failed to send test message${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Trigger bot menu
trigger_menu() {
    echo -e "${BLUE}📤 Sending 'Menu' to trigger bot response...${NC}"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "text": {
                "body": "Menu"
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Menu trigger sent successfully!${NC}"
        echo "Your bot should now respond with the main menu."
    else
        echo -e "${RED}❌ Failed to send menu trigger${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Send interactive menu
send_interactive_menu() {
    echo -e "${BLUE}📤 Sending interactive menu with buttons...${NC}"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {
                    "text": "🌟 *What would you like to explore today?*"
                },
                "action": {
                    "buttons": [
                        {
                            "type": "reply",
                            "reply": {
                                "id": "btn_daily_horoscope",
                                "title": "Daily Horoscope"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": "btn_birth_chart",
                                "title": "Birth Chart"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": "btn_compatibility",
                                "title": "Compatibility"
                            }
                        }
                    ]
                }
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Interactive menu sent successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to send interactive menu${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Send Hi greeting
send_hi() {
    echo -e "${BLUE}📤 Sending 'Hi' greeting...${NC}"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "text": {
                "body": "Hi"
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Hi greeting sent successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to send Hi greeting${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Send Help command
send_help() {
    echo -e "${BLUE}📤 Sending 'Help' command...${NC}"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "text": {
                "body": "Help"
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Help command sent successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to send Help command${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Send menu command
send_menu_command() {
    echo -e "${BLUE}📤 Sending menu command...${NC}"

    response=$(curl -s -X POST "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID/messages" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "messaging_product": "whatsapp",
            "to": "'"$RECIPIENT_PHONE"'",
            "text": {
                "body": "/menu"
            }
        }')

    if echo "$response" | grep -q "messaging_product"; then
        echo -e "${GREEN}✅ Menu command sent successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to send menu command${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Validate WhatsApp token
validate_token() {
    echo -e "${BLUE}🔍 Validating WhatsApp access token...${NC}"

    response=$(curl -s -X GET "https://graph.facebook.com/v18.0/$W1_WHATSAPP_PHONE_NUMBER_ID" \
        -H "Authorization: Bearer $W1_WHATSAPP_ACCESS_TOKEN")

    if echo "$response" | grep -q "verified_name"; then
        echo -e "${GREEN}✅ WhatsApp access token is valid!${NC}"
        echo "Phone Number ID: $W1_WHATSAPP_PHONE_NUMBER_ID"
        echo "Verified Name: $(echo $response | grep -o '"verified_name":"[^"]*"' | cut -d'"' -f4)"
        return 0
    else
        echo -e "${RED}❌ WhatsApp access token is invalid or expired${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Run all tests
run_all_tests() {
    echo -e "${YELLOW}🚀 Running all WhatsApp tests...${NC}"
    echo ""

    local failed_tests=0

    echo "1. Validating token..."
    if ! validate_token; then
        ((failed_tests++))
    fi
    echo ""

    echo "2. Sending test message..."
    if ! send_test_message; then
        ((failed_tests++))
    fi
    echo ""

    echo "3. Triggering menu..."
    if ! trigger_menu; then
        ((failed_tests++))
    fi
    echo ""

    echo "4. Sending interactive menu..."
    if ! send_interactive_menu; then
        ((failed_tests++))
    fi
    echo ""

    echo "5. Sending Hi greeting..."
    if ! send_hi; then
        ((failed_tests++))
    fi
    echo ""

    echo "6. Sending Help command..."
    if ! send_help; then
        ((failed_tests++))
    fi
    echo ""

    echo "7. Sending menu command..."
    if ! send_menu_command; then
        ((failed_tests++))
    fi
    echo ""

    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! WhatsApp integration is working correctly.${NC}"
    else
        echo -e "${RED}❌ $failed_tests test(s) failed. Please check your configuration.${NC}"
    fi

    return $failed_tests
}

# Main script logic
main() {
    # Load environment variables
    load_env

    # Parse command line arguments
    COMMAND=""
    VERBOSE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            test-message|trigger-menu|interactive-menu|send-hi|send-help|menu-command|validate-token|all|help)
                COMMAND="$1"
                shift
                ;;
            -p|--phone)
                RECIPIENT_PHONE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                usage
                exit 1
                ;;
        esac
    done

    # Execute command
    case $COMMAND in
        test-message)
            send_test_message
            ;;
        trigger-menu)
            trigger_menu
            ;;
        interactive-menu)
            send_interactive_menu
            ;;
        send-hi)
            send_hi
            ;;
        send-help)
            send_help
            ;;
        menu-command)
            send_menu_command
            ;;
        validate-token)
            validate_token
            ;;
        all)
            run_all_tests
            ;;
        help|"")
            usage
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"